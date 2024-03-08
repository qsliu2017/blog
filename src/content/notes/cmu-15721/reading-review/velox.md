---
page: 'CMU 15721'
date: 2024-02-28
---

## _Reading Review_ [Velox: Meta’s Unified Execution Engine](https://15721.courses.cs.cmu.edu/spring2024/papers/05-execution2/p3372-pedreira.pdf) (P. Pedreira, et al., VLDB 2022)

- _Overview of the main idea presented in the paper (3 sentences)._

  Computation engines targeted to specific data workloads (e.g. analytical processing, realtime stream processing, AI/ML systems) share little with each other, causing inconsistent user interfaces and engineering waste.

  This paper proposes an reusable and extensible query execution library, and presents its usage in different systems of Meta.

  Thanks to the modular-style design and implementation, its components can be used independently or extended by plugins, based on the functionality required.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  The Velox provides high-level components (type, vector, expression eval, functions, operators, etc.), each of which provides extensibility APIs to add plugins.

- _Workloads / benchmarks used in the paper's evaluation (1 sentence)._

  Comparing the new C++ Velox-based execution engine with the current Presto Java implementation using CPU-bound queries and shuffle/IO heavy queries on the TPC-H dataset.
