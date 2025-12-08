---
title: 'Why Postgres times out on TPC-H Q17 and Q20?'
description: ''
date: 2025-12-08
tags: []
---

_**TL;DR:** The Postgres optimizer lacks subquery unnesting._

In recent years, I've been working on boosting the analytical capabilities of OLTP databases like Postgres. The most popular approach is embedding a DuckDB instance.
To explain why this is worthwhile, I keep referring to the following [TPC-H benchmark from the DuckDB blog](https://duckdb.org/2022/09/30/postgres-scanner#performance).
Notice vanilla Postgres times out on Q17 and Q20.

|  query | duckdb | duckdb/postgres |   postgres |
| -----: | -----: | --------------: | ---------: |
|      1 |   0.03 |            0.74 |       1.12 |
|      2 |   0.01 |            0.20 |       0.18 |
|      3 |   0.02 |            0.55 |       0.21 |
|      4 |   0.03 |            0.52 |       0.11 |
|      5 |   0.02 |            0.70 |       0.13 |
|      6 |   0.01 |            0.24 |       0.21 |
|      7 |   0.04 |            0.56 |       0.20 |
|      8 |   0.02 |            0.74 |       0.18 |
|      9 |   0.05 |            1.34 |       0.61 |
|     10 |   0.04 |            0.41 |       0.35 |
|     11 |   0.01 |            0.15 |       0.07 |
|     12 |   0.01 |            0.27 |       0.36 |
|     13 |   0.04 |            0.18 |       0.32 |
|     14 |   0.01 |            0.19 |       0.21 |
|     15 |   0.03 |            0.36 |       0.46 |
|     16 |   0.03 |            0.09 |       0.12 |
| **17** |   0.05 |            0.75 | **>60.00** |
|     18 |   0.08 |            0.97 |       1.05 |
|     19 |   0.03 |            0.32 |       0.31 |
| **20** |   0.05 |            0.37 | **>60.00** |
|     21 |   0.09 |            1.53 |       0.35 |
|     22 |   0.03 |            0.15 |       0.15 |

So what's going on with these two queries? Let's dig into [Q17](https://github.com/duckdb/duckdb/blob/main/extension/tpch/dbgen/queries/q17.sql).

```sql
SELECT
    sum(l_extendedprice) / 7.0 AS avg_yearly
FROM
    lineitem,
    part
WHERE
    p_partkey = l_partkey
    AND p_brand = 'Brand#23'
    AND p_container = 'MED BOX'
    AND l_quantity < (
        SELECT
            0.2 * avg(l_quantity)
        FROM
            lineitem
        WHERE
            l_partkey = p_partkey);
```

The problem is the **correlated subquery** referring `p_partkey` from the outer query. In Postgres, this subquery runs for every row of `part`, resulting in an $L \times P$ intermediate table. Extremely inefficient.

```sql
-- postgres explain Q17 here
```

DuckDB handles this differently by unnesting [correlated subqueries](https://duckdb.org/2023/05/26/correlated-subqueries-in-sql). It replaces the correlated subquery with a join, bringing complexity down to $L + P$.

```sql
-- duckdb explain Q17 here
```

This optimization technique originates from the paper [Unnesting arbitrary queries](https://portal.fis.tum.de/en/publications/unnesting-arbitrary-queries/) (2015).
As a follow-up, [A Formalization of Top-Down Unnesting](https://arxiv.org/abs/2412.04294) (2024) provides a formal proof of correctness for the unnesting approach presented in the 2015 paper and extends it to a top-down algorithm.
Today, (almost) every modern OLAP database and engine implements this optimization.

[Q20](https://github.com/duckdb/duckdb/blob/main/extension/tpch/dbgen/queries/q20.sql) suffers from the same issue in Postgres. Skip here.

Let's circle back to the benchmark. You might've noticed that while DuckDB beats Postgres on all queries, the DuckDB-Postgres connector ([duckdb_pg](https://github.com/duckdb/duckdb-postgres)) doesn't always beat vanilla Postgres.
Same thing happens with DuckDB-in-Postgres [pg_duckdb](https://github.com/duckdb/pg_duckdb) (name so confusing 😂).

The performance gap comes from all the modern techniques DuckDB uses: vectorized execution, morsel-based parallelism, columnar storage, you name it.
But when query plans are of the same complexity, the execution speedup gets eaten by the overhead of data conversion between row format and columnar format.
For complex queries like Q17 and Q20 though, the conversion cost is worth it for a much better query plan.
