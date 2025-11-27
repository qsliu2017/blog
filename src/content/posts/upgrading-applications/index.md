---
title: 'Upgrading Applications'
description: 'Notes on keeping applications available while versions, APIs, and schemas evolve.'
date: 2025-08-28
tags: []
---

Modern applications have many components, often with multiple instances.
To avoid downtime during upgrades, old and new versions may run together, so they must be compatible with each.
What's more, upgrades should be compatible with data from older versions, even for local apps.

This post walks through two major compatibilities, API and schema, and the best practices for each. The former is the interface; the latter is the stored state.

## Version

The common versioning scheme is `major-minor-patch`. Each part signals how the interface changes.

- `patch` advancing should not change the interface; usually a bugfix or small performance improvement.
- `minor` advancing introduces new interfaces while keeping existing ones working.
- Advancing `major` version breaks old interfaces; there is no backward compatibility guarantee.

The following compatibility matrix shows which client and server versions can work together. (You may notice these are Python versions.)

| ⬇️ Client Ver. \ Server Ver. ➡️ | 2.7.0 | 3.8.1 | 3.8.2 | 3.14.0 |
| ------------------------------: | :---: | :---: | :---: | :----: |
|                           2.7.0 |  ✅   |       |       |        |
|                           3.8.1 |       |  ✅   |  ✅   |   ✅   |
|                           3.8.2 |       |  ✅   |  ✅   |   ✅   |
|                          3.14.0 |       |       |       |   ✅   |

When a release moves forward (client 3.8.x → server 3.14.0), the matrix shows whether a staged rollout is safe. If a cell is empty, expect failures or extra work like shims or dual-writing.

## API Compatibility

Instances communicate via APIs; the popular choices are RESTful and RPC.
Let's think about a RESTful example.

**Approach 1:** Bump up version in URL.
For example: `GET /api/v1/employee/{employee_id}`, `GET /api/v2/department/{department_id}/employee/{employee_id}`.
Clients can pin to their version, and servers can keep multiple handlers alive during a rolling upgrade.

**Approach 2:** Compatible design.
Provide default values for added fields so older clients still work. Another trick is to treat new fields as optional and fill them server-side (e.g. `timezone` defaults to UTC). If a response adds new fields, older clients should ignore unknown keys rather than crash.

## Schema Compatibility

For stateful services, API compatibility is not the end of the story. They store inner state in files or databases.
To upgrade a stateful service, data schema migration should also be taken into consideration.

**Approach 1:** Migration Script in Code

On startup, run a migration script. To avoid data loss, write these scripts carefully.
When upgrading from V1 to V2, the following scenarios should work:

1. V1/V2 start from scratch -> create a full schema
1. V1/V2 restart and see schema of the same version -> do nothing
1. V2 start and see schema of V1 -> run a upgrade script
1. V1 start and see schema of V2 -> fail, or run a downgrade script

Example: add a nullable column with a default, backfill slowly, then mark it NOT NULL in a later release. Split large rewrites into small steps to keep restarts fast.

Libraries help with this, e.g. flyway, [diesel_migrations](https://docs.rs/diesel_migrations/latest/diesel_migrations/).
They keep a linear schema history. Each upgrade script is a migration with a timestamp ID.
On startup, the library checks the current schema version and applies migrations until it is up-to-date.

**Approach 2:** Schema Management Platform

For more complex scenarios, dedicated platforms can help manage schema changes:

- [Bytebase](https://github.com/bytebase/bytebase) is a "GitLab for databases" that helps DBAs and devs collaborate on schema.
  It provides review, workflows, and drift detection when multiple teams touch the same database.
- [Neon](https://github.com/neondatabase/neon) builds branches and time travel into Postgres. Upgraded services can fork a branch from the older one while the old one keeps running.
  Switching branch is also available.
