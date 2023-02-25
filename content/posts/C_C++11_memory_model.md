---
title: C/C++11 Memory Model
date: 2023-01-06
---

C++11 provides the template `std::atomic<T>` for defining arbitrary atomic types. All atomic operations on these types can have several orderings, including:

| Value | Explanation |
|:-:|--|
| `memory_order_relaxed` | no ordering constraints on reads or writes |
| `memory_order_consume` | no reads or writes in the current thread *dependent* on the value currently loaded can be reordered *before* this load |
| `memory_order_acquire` | no reads or writes in the current thread can be reordered *before* this load |
| `memory_order_release` | no reads or writes in the current thread can be reordered *after* this store |
| `memory_order_acq_rel` | no memory reads or writes in the current thread can be reordered *before* the load, nor *after* the store |
| `memory_order_seq_cst` | A load operation with this memory order performs an acquire operation, a store performs a release operation, and read-modify-write performs both an acquire operation and a release operation, plus a single total order exists in which all threads observe all modifications in the same order |

### Relaxed Ordering

Relaxed ordering is the weakest constraint. Loads and stores are not guaranteed to be executed in program order.

For example, both

```C++
// Thread 1:
r1 = y.load(std::memory_order_relaxed); // A
x.store(r1, std::memory_order_relaxed); // B
// Thread 2:
r2 = x.load(std::memory_order_relaxed); // C 
y.store(42, std::memory_order_relaxed); // D
```

and

```C++
// Thread 1:
r1 = y.load(std::memory_order_relaxed);   // A
if (r1 == 42)                             // B
  x.store(r1, std::memory_order_relaxed); // C
// Thread 2:
r2 = x.load(std::memory_order_relaxed);   // D
if (r2 == 42)                             // E
  y.store(42, std::memory_order_relaxed); // F
```

are allowed to produce `r1 == r2 == 42`. Since there is no guarantee how they are executed.

### Release-Acquire Ordering

For example,

```C++
std::atomic<std::string*> ptr;
int data;

// Thread 1:
std::string* p  = new std::string("Hello");         // A
data = 42;                                          // B
ptr.store(p, std::memory_order_release);            // C
// Thread 2:
std::string* p2;
while (!(p2 = ptr.load(std::memory_order_acquire))) // D
    ;
assert(*p2 == "Hello"); // never fires              // E
assert(data == 42); // never fires                  // F
```

`A` and `B` are guaranteed to execute before `C` while `E` and `F` are executed after `D`.

Mutual exclusion locks are an example of release-acquire ordering: when the lock is released by thread A and acquired by thread B, everything that took place in the critical section (before the release) in the context of thread A has to be visible to thread B (after the acquire) which is executing the same critical section.

### Release-Consume Ordering

For example,

```C++
std::atomic<std::string*> ptr;
int data;

// Thread 1:
std::string* p  = new std::string("Hello");         // A
data = 42;                                          // B
ptr.store(p, std::memory_order_release);            // C
// Thread 2:
std::string* p2;
while (!(p2 = ptr.load(std::memory_order_consume))) // D
    ;
// never fires: *p2 carries dependency from ptr
assert(*p2 == "Hello");                             // E
// may or may not fire: data does not carry dependency from ptr
assert(data == 42);                                 // F
```

`A` and `B` are guaranteed to execute before `C`; `E` is guaranteed to execute after `D`, but `F` has no guarantee to execute after `D`.

### Sequentially-consistent Ordering

Atomic operations tagged `memory_order_seq_cst` not only order memory the same way as release/acquire ordering (everything that happened-before a store in one thread becomes a visible side effect in the thread that did a load), but also establish a single total modification order of all atomic operations that are so tagged.

## Weakness of C11 Memory Model

Although the idealised compiler considered naively applies a one-to-one mapping from C memory accesses to machine memory accesses, [some common compiler optimisations are invalid in the C11 memory model](https://plv.mpi-sws.org/c11comp/popl15.pdf) (such as expression linearisation and “roach motel” reorderings). Thus, it cannot be used to define the semantics of intermediate languages of compilers, for instance, LLVM IR.

## Reference
1. [What every systems programmer should know about concurrency](https://assets.bitbashing.io/papers/concurrency-primer.pdf)
1. [Common Compiler Optimisations are Invalid in the C11 Memory Model and what we can do about it](https://plv.mpi-sws.org/c11comp/popl15.pdf)
1. [C++11 Memory Order](https://en.cppreference.com/w/cpp/atomic/memory_order)
