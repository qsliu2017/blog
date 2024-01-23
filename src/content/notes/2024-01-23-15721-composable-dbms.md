---
page: 'CMU15721 Readings'
date: 2024-01-23
---

## [The Composable Data Management System Manifesto](https://15721.courses.cs.cmu.edu/spring2024/papers/01-modern/p2679-pedreira.pdf) (P. Pedreira, et al., VLDB 2023)

- _Overview of the main idea presented in the paper (3 sentences)._

  Specialized data management systems have been rapidly invented and developed for different workloads.
  The lack of reusing design and components in these systems causes many problems, including incompatible SQL/non-SQL API and inconsistent semantic between different systems.
  This paper advocates a composable paradigm in data management systems and purposes a modular architecture.

- _Key findings/takeaways from the paper (2-3 sentences)._

  - A modular data stack consists of a components which are reused in different data management systems.
  - A well-defined and system-agnostic intermediate representation (IR) to seperate language and execution.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  Seperate the monolith data systems into a modular data stack consists of a language frontend, an intermediate representation (IR), a query optimizer, an execution engine and an execution runtime.

- _Workloads / benchmarks used in the paper’s evaluation (1 sentence)._

  N/A
