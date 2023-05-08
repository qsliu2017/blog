---
title: How to Make a Developer Happy?
date: 2023-05-08
---

### Unit Tests (UT)

Everyone in this industry *knows* the importance of UT, but most do not write it. Developers who are familiar with the project might think the code is straightforward and does not need UTs.

However, imagine your new colleague who is assigned to an on-board task or a user from the community who is trying to fix a bug. UTs can help them find the related code instead of understanding the whole project. Sometimes, UTs are even more important than documentation.

### Less Toolchain

A past boss of mine said, "Don't use **Makefile** when you can use **Shell Script**." Use as few build tools as possible; that makes potential contributors' lives easier.

Think twice before you add components. Most of the time, microservices are unnecessary. For instance, if you need a DB, use SQLite instead of Postgres, or use the embedded version.

### All-in-One Package Manager

Personally, I hate Java because of Maven and Gradle. Modern programming languages like Golang and Rust do a great job.

### Pull Request (PR) Template

Some open-source projects only open-source their code, but not their work process. Write a `Contributing.md` or a PR Template to let your contributors know how to contribute to the project.

### Timely Feedback CI

Even if you have tried to make your UTs easy to run on a laptop, some end-to-end tests might still need to run on a CI environment. Make sure your CI can give timely feedback to your contributors. For projects using Github Actions, you can check out this [post](../github_actions_demo).
