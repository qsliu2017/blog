---
title: Don't Schedule My Threads
date: 2024-04-25
tags: [multi-thread, OS]
draft: true
---

## Multi-Threads Application

MySQL (single process, multi-thread), PostgreSQL (multi-process): employ OS to schedule tasks (# of tasks = # of OS processes/threads).

## Single Thread Event-Loop

NodeJS employs only one OS thread, thus schedule its tasks by itself.

## One-Thread-Per-Core Architecture

Modern applications employ OS threads to utilize multi-core CPUs, but schedule tasks by themselves. The ability of scheduling usually provided by PL (e.g. Golang's GMP model, Rust's async/await + tokio, C++ 20 Coroutines, Java 21 Virtual Threads).

## Lessons

Scheduling includes two parts: utilizing multi-core CPUs and concurrency task control. OS did both in the past, but modern applications tend to separate them. Because application (always) knows better about its tasks than OS.
