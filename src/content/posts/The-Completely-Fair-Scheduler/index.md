---
title: The Completely Fair Scheduler
date: 2022-11-15
tags: [OS, Linux, Sched]
math: true
---

## TL;DR

CFS picks the task with the smallest runtime to balance tasks' runtime. Implemented by red-black tree with the leftmost node cached, picking the next task is $O(1)$!

# Linux Implementation

## Time Accounting

Task's schedule info is defined in [`struct sched_entity`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/include/linux/sched.h#L547).
There is a [`vruntime`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/include/linux/sched.h#L556) field recording the _virtual runtime_ of the task, which is the _actual runtime_ normalized by the number of runnable tasks.

When [`update_curr()`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/kernel/sched/fair.c#L882), a weighted delta will be added to the `vruntime`.
The calculation defined in [`calc_delta_fair()`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/kernel/sched/fair.c#L694) and [`__calc_delta()`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/kernel/sched/fair.c#L308:12) is as follow:

$$
\text{actual runtime} \times \frac{w_0}{w}
$$

where $w$ is the weight decided by nice value in [`sched_prio_to_weight[40]`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/kernel/sched/core.c#L11180) and $w_0$ is the weight of nice 0 (i.e. `sched_prio_to_weight[20]`).

```c
const int sched_prio_to_weight[40] = {
 /* -20 */     88761,     71755,     56483,     46273,     36291,
 /* -15 */     29154,     23254,     18705,     14949,     11916,
 /* -10 */      9548,      7620,      6100,      4904,      3906,
 /*  -5 */      3121,      2501,      1991,      1586,      1277,
 /*   0 */      1024,       820,       655,       526,       423,
 /*   5 */       335,       272,       215,       172,       137,
 /*  10 */       110,        87,        70,        56,        45,
 /*  15 */        36,        29,        23,        18,        15,
};
```

## Task Selection

Runnable tasks are placed in a red-black tree, with the `vruntime` as the key. Adding a runnable task is the same as inserting a node into that red-black tree, while removing a runnable task is the same as deleting. And these two operations are $O(\log{n})$, where $n$ is the number of nodes.

Picking the next task to run is the same as picking the leftmost node in the tree, which has the smallest `vruntime`. This operation is so frequent that Linux makes an optimization which is caching the leftmost node and updating the cache while inserting and removing. By this optimization, picking the next task is $O(1)$!

## Timeslice

Timeslice is how long a task runs. CFS calculates how long a task should run as a function of the total number of runnable tasks. Each task runs for a _timeslice_ proportional to its weight divided by the total weight of all runnable threads.

The actual timeslice is called the _targeted latency_. Smaller latency yield better interactivity and a closer approximation to perfect multitasking, at the expense of higher switching costs and thus worse overall throughput.

CFS imposes a floor on the timeslice assigned to each task. This floor is called the _minimum granularity_ which is 1 millisecond by default. Thus, even as the number of runnable tasks approaches infinity, each will run for at least 1 millisecond, to ensure there is a ceiling on the incurred switching costs.

Overall, a task will get timeslice as follow:

$$
\max(\text{targeted latency} \times \frac{w}{\sum w}, \text{minimum granularity})
$$

## Scheduler Classes

In fact, CFS is not the only scheduler in Linux. There are other algorithms for scheduling different types of tasks (e.g. real-time tasks). To enable different, pluggable algorithms to coexist, Linux uses the modularity called _scheduler classes_.

The base schedule iterates over each scheduler class in order of priority. The highest priority scheduler class that has a runnable process wins, selecting who runs next. The CFS is registered as [`SCHED_NORMAL`](https://github.com/torvalds/linux/blob/fef7fd48922d11b22620e19f9c9101647bfe943d/include/uapi/linux/sched.h#L114), which has the lowest priority.

# Comparing with Traditional Scheduler

Modern process schedulers have two common concepts: _priority_ and _timeslice_. Timeslice is how long a process runs. Processes with a higher priority run more frequently and/or (on many systems) receive a higher timeslice.

Priority in Unix is in the form of _nice_ values, but in practice it leads to several pathological problem.

1. Mapping nice values onto _absolute timeslices_ leads to frequent context switching of tasks with lower priority.

   Let's say we map nice 0 to timeslice of 100 ms, while nice 20 to 5 ms. When there are two tasks both has nice 0, each task has a timeslice of 100 ms and context-switching happens every 200 ms. But for two tasks with nice 20, even though each has a half of the CPU time, context-switching happens every 10 ms! Considering tasks with high nice value are usually CPU-bounded, this leads to a low overall throughput.

1. Mapping nice values onto timeslices in a arithmetic sequence leads to wildly different effects depending on the nice value.

   Let's say we map nice 0 to timeslice of 100 ms, nice 1 to 95 ms, etc. A task with nice 0 and another with nice 1 are almost the same, while a task with nice 18 (10 ms) has twice timeslices as another with nice 19 (5 ms).

1. Timeslices are limited by the timer tick.

   The timeslice must be some integer multiple of the timer tick. The minimum timeslice has a floor of the period of the timer tick. The system timer limits the difference between two timeslices. Timeslices change with different timer ticks.

1. Optimition of running a freshly woken-up tasks immediately for interactice tasks might be abused.

The approach taken by CFS is a radical (for process schedulers) rethinking of timeslice allotment: Do away with timeslices completely and assign each process a proportion of the processor. CFS thus yields constant fairness but a variable switching rate.

# References

1. [Linux Kernel Development 3rd Edition](https://www.amazon.com/Linux-Kernel-Development-Robert-Love/dp/0672329468)
1. [Inside the Linux 2.6 Completely Fair Scheduler](https://developer.ibm.com/tutorials/l-completely-fair-scheduler)
