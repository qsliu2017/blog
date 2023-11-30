---
title: Understand Git Objects in Relational Model
date: 2023-11-27
tags: [Git]
description: Understand Git objects in relational model.
---

There are 4 type of objects in Git storage: blob, tree, commit and branch/tag. In this post, we try to understand these objects in a relational model.

## Object ID

In Git, each object has an OID (Object ID). The ID is the SHA-1 hash of the object content.
Since OID is used frequently in the following sections, we defind it as a type.

```sql
CREATE TYPE oid AS binary(256);
```

## Blob is a File

The first object is `blob`. Blob represents a file in the repository.

```sql
CREATE TABLE blob (
    _oid oid,
    content BLOB
);
```

The prefix underscore in `_oid` indicates that it is not physically stored in the object. On the other hand, `content` is stored in the object and it is the only payload of the blob object.

Note that there is no filename stored in the blob object, nor the other metadata of the file. In fact, this metadata is stored in the tree object. We will discuss it later.

An important difference between this SQL schema and the actual Git storage is that the content can be only indexed by `_oid`, i.e. the `SHA1(content)`. That means we can not search a blob by its content directly.

## Tree is a Directory

The second object is `tree`. Tree represents a directory in the repository. We browse the content of a tree object by `git cat-file` command.

```sh
git cat-file -p e0504e788345f65315e6a53f992b40f503937618
040000 tree ea7cab952a09f0c8d6c3d74e3f72c011aec794e0    .github
100644 blob 6240da8b10bfc3ab9dc4564c4169453cf143db7f    .gitignore
100644 blob 92280800c38a7edb2e5dd3a89602aa4857adcbe2    .prettierrc
040000 tree 3b444578da46570923e19673c309503f6c42752c    .vscode
100644 blob f6d4ce044edd974f0d5d752ce8591f0282f86ed0    LICENSE
100644 blob c7cf6d75fc413de1386b1c005da03dd4df1c95be    astro.config.mjs
100644 blob 5d3d5a9d14deff76470cf0105a8e233986235cd9    package-lock.json
100644 blob 8c44bc97117ec7b43cd15edb6c562f25db871304    package.json
040000 tree 5cf636ff3d0cf422423e4a09f7bdd7a5636f9851    public
040000 tree 3a470abd49534a41d5231a16bb4f2040b26593f9    src
100644 blob 8358535e3131c2f8fe2f34ce16aaacd333037628    tailwind.config.cjs
100644 blob 6befff5128e6b06c8984595d7b786bee41d02367    tsconfig.json
```

This content can be described by the following table.

```sql
CREATE TABLE tree (
    _oid oid,
    mode text,
    type text,
    child_oid oid,
    path text
);
```

Each tree object has one or more children, so we use a relation table to store the tree. Since a tree object has nothing except its children items, we just ignore the tree entity table.

Each row in the `tree` table represents a child of a tree object, which can be a blob object or another tree object. Thus `child_oid` field is reference to `blob(_oid)` or `tree(_oid)`. However this type of reference is not supported by SQL, so we just omit the foreign key constraint. Instead, we use field `type` to indicate the type of the child object.

`path` is the filename or subdirectory name. Note that a tree only stores its direct children, so the path is relative to the tree object and does not contains `.` or `/`. Another metadata of child, the privilege mode, is also stored in tree object.

An empty directory is not stored in Git. Thus there is no empty tree object.

If two files have the same content, they will have the same OID. Different tree objects might have the same child OID. Thus the `child_oid` is not unique.

## Commit is a Pointer to a Tree

We can now talk about the most important object in Git: commit. A commit is a _snapshot of the repository_, i.e. the repository at a certain time. Thus a commit contains an OID of a tree object, which is the root directory of the repository at that time.

```sql
CREATE TABLE commit (
    _oid oid,
    root_tree_oid oid REFERENCES tree(_oid),
    message text,
    author text,
    committer text,
    ... /* other metadata */
)
```

A commit object contains an OID of the root tree object with other human-readable information such as commit message, author and committer. We can use `git cat-file` command to browse the content of a commit object.

```sh
> git cat-file commit 246f96e522e28bedc4440a7975c2740299f9db1e
tree e2596c64cacac113cc7580a02172bb33971851ea
parent d0ddfd99729215f5937ea5f9ea34c437aae58cd6
parent 61dfa40fa16a960060af3e440914db11f8e9c24a
author qsliu <qsliu2017@outlook.com> 1700130352 +0800
committer qsliu <qsliu2017@outlook.com> 1700130352 +0800

post: ci system the users perspective
```

But wait, what's the `parent` in the content of the commit object?

## (Cont.) Commit is also a Pointer to Parent Commit(s)

Recall that Git is a _version control_ system. The snapshots of repository in different time are not enough. To represent the revoluation and branches of the repository, we need the relationship between snapshots. Thus commit object also contains OID of its parent commit(s). This relationship can be represented by the following table.

```sql
CREATE TABLE commit_parent (
    _commit_oid oid REFERENCES commit(_oid),
    parent_commit_oid oid REFERENCES commit(_oid)
);
```

A commit might have zero, one or more parents.

- If a commit has zero parent, it is the first commit of the branch.
- If a commit has one parent, it is a normal commit.
- If a commit has more than one parent, it is a merge commit.

## Branch/Tag is an Alias to a Commit

Finally, we discuss branch/tag. However they are _NOT_ objects and do not have an OID. Instead, they are just aliases to a commit object.

We can browse the structure of the `.git/refs` directory to see the branch/tag.

```sh
> tree refs
refs
├── heads
│   └── main
├── remotes
│   └── origin
│       ├── HEAD
│       └── main
└── tags

5 directories, 3 files
> cat refs/heads/main
60b2c0f448a7d04f5a9ebf5f6a46cfc6c5a83998
> cat refs/remotes/origin/HEAD
ref: refs/remotes/origin/main
> cat refs/remotes/origin/main
60b2c0f448a7d04f5a9ebf5f6a46cfc6c5a83998
```

As we can see, branches and tags are stored in the `refs` directory. And the path to that file is also the branch reference name. For example, the branch `main` can be referenced by `refs/heads/main`. Each branch or tag just simply contains the OID of the commit object, or the reference to another branch/tag.

The difference between branch and tag is that branch is mutable, while tag is immutable. Branch commit is moved when we commit a new snapshot, while tag commit is fixed.

We can also tell that remote branches has no difference with local branches. They are just stored in different directories and updated by different commands.

## Conclusion

In this post, we discuss objects in Git storage and try to understand them in a relational model. Blob object is content of a file while tree object is a directory. Commit object is a snapshot of the repository, pointing to both the root tree object and its parent commit(s). Branch/tag is a pointer to a commit object but is not an object itslef.

## Other Resources

1. [_Git Internals - Git Objects_](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) chapter in the _Pro Git_ book has the most detailed explanation of Git objects.

1. "But wait, I thought commit is diff?"

   Most Git clients display a commit by the diff of the commit and its parent commit(s), and usually we only care about the diff. [_Commits are snapshots, not diffs_](https://github.blog/2020-12-17-commits-are-snapshots-not-diffs/) explains why commit is a snapshot and not a diff. And the author also discusses how the `cherry-pick`, `rebase` and `merge` do when commit is actually a snapshot.

1. The idea of seeing Git as a database comes from [_Git’s database internals_](https://github.blog/2022-08-29-gits-database-internals-i-packed-object-store/), where the author sees Git as a key-value database and discusses more about how to query the Git objects.
