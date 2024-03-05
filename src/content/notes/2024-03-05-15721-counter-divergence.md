---
page: 'CMU 15721'
date: 2024-03-05
---

## _Reading Review_ [Make the Most out of Your SIMD Investments: Counter Control Flow Divergence in Compiled Query Pipelines](https://15721.courses.cs.cmu.edu/spring2024/papers/06-vectorization/lang-vldbj2020.pdf) (H. Lang, et al., VLDB Journal 2020)

- _Overview of the main idea presented in the paper (3 sentences)._

  SIMD instructions are widely intergrated with database systems today, but the underutilization due to control flow divergence causes the performance degradation in compiling database systems.
  This paper presents an algorithm using AVX-512 instructions to refill the inactive SIMD lanes and also purposes two strategies to integrate this algorithm into the query compilation process.
  The evaluation shows the considerable performance improvement and suggests a hybrid approach to be optimal for different workloads.

- _Key findings/takeaways from the paper (2-3 sentences)._

  The partial consume strategy works for relatively simple workloads but may cause performance degradation for complex workloads, because of the underutilization caused by protected lanes and a potential suboptimal memory access pattern on refill.

  Refill algorithms and strategies are generally applicable to any data processing system that uses AVX-512 SIMD instructions, e.g. Apache Arrow.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  The modified system buffers or remains the active SIMD lanes in the SIMD register and refill the inactive lanes with the values from memory or other SIMD registers.

- _Workloads / benchmarks used in the paper's evaluation (1 sentence)._

  (1) A table scan query based on TPC-H Query 1, (2) a hashjoin query, and (3) an approximate geospatial join query.
