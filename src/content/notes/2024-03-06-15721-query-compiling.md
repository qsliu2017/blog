---
page: 'CMU 15721'
date: 2024-03-06
---

## _Reading Review_ [Efficiently Compiling Efficient Query Plans for Modern Hardware](https://15721.courses.cs.cmu.edu/spring2024/papers/07-compilation/p539-neumann.pdf) (T. Neumann, VLDB 2011)

- _Overview of the main idea presented in the paper (3 sentences)._

  As CPU cost became the bottleneck of DBMSs, iterator style query processing shows poor performance due to its lack of locality and frequent instruction mispredictions.

  This paper purposes a data centric style processing which try to keep data in CPU registers as long as possible and thus achieve better locality.

  The presented framework groups operators in the same pipeline, and compiled them into native machine code using LLVM IR.

- _Key findings/takeaways from the paper (2-3 sentences)._

  Pipeline breaker cannot continue processing with CPU registers only, because it either has out-of-the-register input tuple or must materializes all tuples.

  The generated code is significantly faster especially for simple query, because of better code quality.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  The presented system employs data centric processing, push based data flow, and code generation using LLVM.

- _Workloads / benchmarks used in the paper's evaluation (1 sentence)._

  TPC-CH workload for comparing overall system performance and valgrind emulation for profiling code quality.
