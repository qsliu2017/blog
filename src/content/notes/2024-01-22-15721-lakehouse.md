---
page: 'CMU 15721'
date: 2024-01-22
---

## _Reading Review_ [Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics](https://15721.courses.cs.cmu.edu/spring2024/papers/01-modern/armbrust-cidr21.pdf) (M. Armbrust, et al., CIDR 2021)

- _Overview of the main idea presented in the paper (3 sentences)._

  The 2-tier data lake + warehouse architecture with complex ETL process suffers from data inconsistence/staleness and other problems.
  This paper presents an unified data warehouse architecture, which stores data in a low-cost object storage using open direct-access format.
  Optimizations like caching and indexing on top of a metadata layer allow this system to achieve competitve performance.

- _Key findings/takeaways from the paper (2-3 sentences)._

  - Standard data format allows different kinds of application to directly access data and thus avoids data staleness.
  - Metadata layer provides traditional DBMS data management features (e.g. ACID transactions) and allows performance optimizations.

- _Brief description of the system evaluated in the paper and how it was modified / extended (1 sentence)._

  Lakehouse stores data in a low-cost object storage (S3 in particular) using a open direct-access data format and builds a transactional metadata layer to implements management features.

- _Workloads / benchmarks used in the paper's evaluation (1 sentence)._

  TPC-DS power time and cost among popular cloud data warehouses.
