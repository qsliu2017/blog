---
page: 'CMU 15721'
date: 2024-01-24
---

## _Reading Review_ [An Empirical Evaluation of Columnar Storage Formats](https://15721.courses.cs.cmu.edu/spring2024/papers/02-data1/p148-zeng.pdf) (X. Zeng, et al., VLDB 2023)

- _Overview of the main idea presented in the paper (3 sentences)._

  Widely adopted open-source columnar storage formats were developed over 10 years ago, since then both hareware and workload lanscapes have changed.
  The authors develop a framework to generate workloads, which has a similar value distribution as real-world workloads.
  Using those workloads as benchmark, this paper compares the performance and space efficiency between Parquet and ORC.

- _Key findings/takeaways from the paper (2-3 sentences)._

  - Beneficial design decisions: (1)using dictionary encoding, (2)favoring decoding speed over compression ratio for integer encoding algorithms, (3)making block compression optional, and (4)embedding finer-grained auxiliary data structures.
  - Most widely adopted formats are not optimized for common ML workloads and GPUs decoding.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  N/A

- _Workloads / benchmarks used in the paper's evaluation (1 sentence)._

  In the real-world liked workloads, the benchmark tests the data process performance and the space efficiency of Parquet and ORC format.
