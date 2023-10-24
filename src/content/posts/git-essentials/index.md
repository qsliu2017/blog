---
title: Git Essentials
date: 2023-10-24
tags: [Git]
description: Git essentials I want my colleagues to know.
---

All students recently graduated from Computer Science college know about AI, Database, System and Algorithm, but rare of them know about Git more than `git commit` and `git merge`. When I have to work with them, and review their code, the messy commit history makes me crazy. So here it is, the Git essentials I want my colleagues to know.

## Don't `pull` it, `fetch` it

Every morning you come to the office, the first thing you should do is catching up with the latest code. But do NOT `git pull` it. Actually `git pull` = `git fetch` + `git merge`. In other words, `git pull` will perform `git merge` automatically, which might probably mess up the commit history, if not cause conflicts.

Instead, `git fetch` only fetch the remote and update the remote branch on your local git repository (say `origin/main`). Then you need to scan the commit history, get to know what is going on and decide how to deal with it.

## Don't `merge` it, `rebase` it

A common workflow is, creating a new branch (from `main` branch), doing something on it (with one or more commits), and then opening a PR (Pull Request) or MR (Merge Request) to ask for review. But often, the `main` branch has been updated by others since our branch is created. So we need to update our branch before opening the PR/MR.

Some people will `git merge main` to update their branch. But this will create a new commit, which is unnecessary and will mess up the commit history. Instead, we should `git rebase main` to update our branch. This will replay our commits on top of the latest `main` branch, and keep the commit history clean.

## Someone else done the same thing: `cherry-pick`

You should try to avoid this situation by talking about your plan to your colleagues. But sometimes it just happened. Therefore only parts of commits you want to keep.

Under this situation, you should create a new branch from the latest `main` branch, and `git cherry-pick` the commits you want to keep. You will be thankful for yourself if you keep commits atomic and meaningful.

## Don't `blame` me

Don't use `git blame` to blame others (even though it's named after it). Instead, use `git blame` to find who is repsonsible for a specific line of code when you want to ask for help. `git history -L<start>,<end>:<file>` is also good to find the commit history of a specific line of code.

## Reference
1. [MIT 6.NULL](https://missing.csail.mit.edu/) contains subjects rarely covered in common CS cources, including Git.
2. [GitHub Copilot for CLI](https://githubnext.com/projects/copilot-cli) includes a powerful command `git?` used for searching specifically for git invocations.
