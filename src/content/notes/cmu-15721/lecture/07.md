---
page: 'CMU 15721'
date: 2024-03-07
---

## _Lecture Note_ 07.Code Generation & Compilation

### Code Specialization

Generate task-specific code for _CPU-intensive_ task that has a similar execution pattern on different inputs, including:

- Access Methods
- Stored Procedures
- Query Operator Execution
- Predicate Evaluation (most common)
- Logging Operations

### Approach #1: Transpilation

Debugging is relatively easy but it takes a relatively long time to compile.

### Approach #2: JIT Compilation

HyPer does aggressive operator **fusion** within pipelines, and compile queries in-memory into native code using the LLVM toolkit.
