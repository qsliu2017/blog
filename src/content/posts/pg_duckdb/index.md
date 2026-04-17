---
title: 'pg_duckdb: Bad idea, right?'
description: ''
date: 2026-04-17
tags: [Postgres, DuckDB]
---

I've been working on [pg_ducklake](https://github.com/relytcloud/pg_ducklake), an extension that brings native lakehouse to Postgres. Internally, it uses pg_duckdb to manage a DuckDB instance inside a Postgres process -- pg_duckdb parses and de-parses SQL, hands it to DuckDB, and provides a Postgres table reader for DuckDB to use.

I love both Postgres and DuckDB, and building pg_ducklake has been a lot of fun. But along the way I've run into real tradeoffs with the pg_duckdb approach. No complaints -- just sharing what I've learned and looking for discussion.

## Resource Isolation

Putting long-running, resource-heavy OLAP tasks inside a Postgres process is risky. When running a big analytic job, DuckDB will eat all available memory and CPU. DuckDB will exceed `duckdb.memory_limit` and still have memory leaks. This is not a big problem for ad-hoc queries, but for a long-running Postgres instance, a slow leak can eventually OOM and crash the entire server.

Postgres is built for robustness -- a single query should never take down the server. But failure is common for OLAP workloads. DuckDB is designed to push hardware limits, which is exactly what you don't want inside your transaction-processing database.

## Mixed Transactions

If a query writes to both a Postgres table and a DuckDB table, you have a distributed transaction. pg_duckdb doesn't resolve this -- no two-phase commit, so you can end up with partial writes.

DuckLake sidesteps this: its ACID is all handled by the catalog database, i.e. Postgres. DuckDB only reads and writes data files; the transaction boundary lives in Postgres alone.

## Thread Safety

Postgres is one-process-per-connection, so its routines are almost entirely not thread-safe -- memory allocation, table scanning, catalog access, none of these are safe to call from multiple threads.

DuckDB is heavily multi-threaded. When DuckDB threads need Postgres utilities, they have to serialize, which is a potential performance loss. This also creates subtle bugs. One of the worst I hit is signal handling ([pg_duckdb#1002](https://github.com/duckdb/pg_duckdb/issues/1002)) -- Postgres signal handling is not thread-safe, but signals can be delivered to any thread of DuckDB.

## Extensibility

Postgres and DuckDB are both highly extensible on their own. But when you try to extend Postgres _with_ DuckDB, things get awkward. If two extensions both want to embed DuckDB -- say pg_duckdb and pg_ducklake -- you have a few options:

**1. Merge everything into pg_duckdb.** When pg_ducklake first started, people asked if we'd eventually merge into pg_duckdb. But there are (and will be) many extensions that want to embed DuckDB for different purposes -- analytics, external table scanning, columnar storage. You can't put all of that into one extension.

**2. Let pg_duckdb manage a shared DuckDB instance, expose access via ABI.** This is what we did in pg_ducklake. But we ended up with so much customization that users have to install _our_ fork of pg_duckdb. And interacting with another extension via ABI is a code smell in Postgres.

**3. Each extension manages its own DuckDB instance.** This is what I've been thinking about lately. The biggest downside: if both extensions provide new table access methods -- say MotherDuck remote tables and DuckLake tables -- cross-table queries become a problem.

**4. Do it the Postgres way.** Provide a `DuckDB_Scan` node, and let the optimizer push up and merge multiple `DuckDB_Scan` nodes into a bigger one that DuckDB can handle without leaving its engine. Looks good on paper. Very big engineering. ~~If Moore's law on LLMs holds for another 6 months, I'd give it a try.~~
