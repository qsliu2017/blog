---
page: 'CMU 15721'
date: 2024-03-05
---

## _Lecture Note_ 05. Vectorized Query Execution

### Implementation Approaches

- Automatic Vectorization
- Compiler Hints (e.g. `restrict` in C/C++)
- Explicit Vectorization (use CPU intrinsics directly or libraries)

Implementing an algorithm using SIMD is still mostly a manual process.

### Vectorization Fundamentals

- Masking
- Permute
- Selective Load/Store
- Compress/Expand
- Selective Gather/Scatter

### Vectorized DBMS Algorithms

- Selection Scans
- Vector Refill
  - Buffered
  - Partial
- Hash Tables
- Partitioning / Histograms

_Takeaway_: AVX-512 is not always faster than AVX2 due to clock speed downgrade.
