---
title: Don't Schedule My Threads
date: 2024-04-25
tags: [multi-thread, OS]
---

When you run a program, something has to decide which task runs next, and on which CPU core. For decades, that was the operating system. Modern applications increasingly handle scheduling themselves.

## OS-Managed Scheduling

The traditional approach is straightforward -- create an OS thread (or process) for each concurrent task and let the kernel scheduler figure out the rest.

MySQL spawns a thread per connection. PostgreSQL spawns a process per connection. Despite the difference in resource model (threads share memory, processes don't), the scheduling story is the same: the OS decides when each task runs, for how long, and on which core.

This works, but it has costs. Each OS thread or process carries kernel data structures (stack, page tables, file descriptor table), and context-switching between them means flushing caches and saving/restoring registers -- cycles spent on bookkeeping, not work. The OS scheduler is also general-purpose: it treats every thread equally because it has no idea what the application is actually doing.

## Single-Thread Event Loop

Node.js went the other direction. One OS thread, one event loop, application schedules everything itself.

For I/O-bound workloads, this is elegant. No locks, no context switches between tasks, no scheduling overhead. When a task waits on I/O, it yields, and the event loop picks up the next one. The application has full control over ordering and priority.

The tradeoff is obvious: you have one thread, so you use one core. On a 16-core machine, 15 cores sit idle. You can work around this with `cluster` or worker threads, but that's bolting multi-process coordination onto a model that was designed to avoid it.

## One Thread Per Core

The modern answer takes the best of both: use OS threads to occupy all cores, but schedule tasks in user space.

The idea is simple. Spawn one OS thread per CPU core -- no more, no less. Then multiplex many lightweight tasks onto those threads. The OS still schedules the threads, but since there's exactly one per core, there's almost nothing to decide. The real scheduling -- which task runs on which thread, what to do when a task blocks -- happens inside the application runtime.

Go and Rust both take this approach, but they get there differently. Go relies on a heavyweight runtime; Rust leans on the compiler.

### Go's GMP Model

Go's scheduler is built around three concepts:

- **G** (Goroutine): a lightweight task. Millions can exist at once.
- **M** (Machine): an OS thread. Typically one per core.
- **P** (Processor): a scheduling context that connects G's to M's. The number of P's equals `GOMAXPROCS` (default: number of cores).

Each P maintains a local run queue of goroutines. When a goroutine is ready to run, the P picks one from its queue and runs it on its M. When the local queue is empty, the P steals goroutines from other P's -- this is **work stealing**, and it keeps all cores busy without centralized coordination.

The interesting part is what happens when a goroutine blocks. If a goroutine makes a blocking syscall (like reading a file), the M is stuck waiting in the kernel. Go detaches the P from that M and assigns the P to a new M (creating one if needed), so the remaining goroutines keep running. When the syscall returns, the original M parks itself and the goroutine gets re-queued.

The Go compiler cooperates by inserting yield points at function calls, so the runtime can preempt long-running goroutines without relying on OS signals.

### Rust's Tokio

Rust takes a different path. Instead of a runtime that manages everything, Rust's `async/await` lets the compiler do the heavy lifting.

When you write an `async fn` in Rust, the compiler transforms it into a state machine. Each `.await` point becomes a state transition -- the function remembers where it paused and what local variables it held. This means a "suspended task" is just a struct on the heap, not a stack frame.

Tokio, the most widely used async runtime, runs a thread pool (one thread per core by default). Each thread has a local task queue, and when a thread runs out of work, it steals tasks from other threads -- the same work-stealing strategy as Go's GMP, but applied to compiler-generated state machines instead of runtime-managed goroutines.

Because tasks yield explicitly at `.await` points rather than at runtime-inserted checkpoints, Tokio's scheduler is simpler. It doesn't need to preempt tasks or manage goroutine stacks. The cost is that a task that never awaits will block its thread -- the programmer has to get the yield points right.

### Others

C++20 introduced coroutines. Java 21 shipped virtual threads (Project Loom). The details differ, but the direction is the same: user-space scheduling on top of a small pool of OS threads.

## Why Applications Take Over

Scheduling is splitting into two concerns.

1. **Utilizing multiple cores** -- still the OS's job, but with one-thread-per-core, it's trivial.
2. **Ordering and prioritizing tasks** -- increasingly the application's job.

The OS scheduler is general-purpose by necessity. It has to be fair across all processes, it can't look inside your application to understand task dependencies, and its tuning mechanism is limited (e.g. `nice`). An application runtime, on the other hand, knows which tasks are I/O-bound, which share data, and which are latency-sensitive. It can make smarter decisions because it has more information.

The application knows its own work better than the OS ever could.
