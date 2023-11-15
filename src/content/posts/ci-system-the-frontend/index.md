---
title: "CI System: The UI"
date: 2023-11-13
draft: true
tags: [CI, GitHub Actions, GitLab CI/CD, Dagger]
description: This post introduces the UI design of CI systems.
---

[CI (Continuous Integration)](https://en.wikipedia.org/wiki/Continuous_integration) originally means to merge code changes into a shared repository frequently. To achieve this, a *CI system* is required to build, test, and deploy the code automatically. This post introduces the user interfaces design of CI systems with some widely used CI systems as examples.

## Container Model

With the container technology becoming widly used and well-known, almost modern CI systems use container model as its first option, if not the only option. The container model can be described as follows: the system runs steps (usually bash scripts) in a container. The CI environment is isolated from the host environment and for every run, a brand new container is created. Thus user (CI script developer) do not need to worry about the environment.

Let consider a common workflow of CI system.