---
page: 'CMU 15721'
date: 2024-03-07
---

## _Reading Review_ [Don't Hold My Data Hostage: A Case for Client Protocol Redesign](https://15721.courses.cs.cmu.edu/spring2024/papers/12-networking/p1022-muehleisen.pdf) (M. Raasveldt, et al., VLDB 2017)

- _Overview of the main idea presented in the paper (3 sentences)._

  The dominant cost of query that transfers a large amount of data is the cost of result set (de)serialization and network, compared to that of connecting and executing.

  While previous works focus on avoiding data exporting, this paper researches on improving result set serialization (RSS).

  The authors benchmark the RSS methods of major DBMSs in different network environments, discuss the design choices in RSS method, and purpose a new protocol.

- _Key findings/takeaways from the paper (2-3 sentences)._

  Both the latency and the throughput of network have the impact on overall performance.

  The RSS protocol design space is generally a trade-off between computation and transfer cost.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  The custom protocol serializes the result to column-major chunks and uses a heuristic for determining the compression method.

- _Workloads / benchmarks used in the paper's evaluation (1 sentence)._

  TPC-H/American Community Survey (ACS)/Airline On-Time Statistics, each of which has different typical data types and distribution.
