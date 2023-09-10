---
title: "Buffer Pool Management"
date: 2023-09-10
tags: [Algorithm]
draft: true
---

In this post, we will introduce the general buffer pool management in computer science.

## Buffer

Buffer is a middle layer between the requester and the storage.

It's always *faster* than the storage.
Consider CPU (requester), memory (buffer) and disk (storage). When CPU asks for a chunk of data that is already in the memory, the data can be returned to CPU directly, which is much faster than asking the disk.

However buffer usually has a *smaller* amount than the storage. That means not all the data in the storage can be stored in the buffer. Direct access to the disk can not be avoided.

According to the [locality principle](https://en.wikipedia.org/wiki/Principle_of_locality), requests to data are not random. In another word, some data are requested more frenquently than others. That's why buffer can work.

## Buffer Pool Management

Buffer pool management is about how to maintain the most frequently requested data in the buffer, to reduce the direct access to the storage.

Buffer pool systems should be *transparent* to the requester. The buffer should handle the request to the storage silently if the data is not in the buffer (a.k.a. cache miss). The requester do not need to know whether a direct access happens or not.

## Cache replacement policies

[TBD]

- LFU
- LRU
- LRU-K
- Clock

## In Action

Buffer pool management must be one of the most common techniques in computer science. It's used in almost every layer of the computer system.

| Buffer | Storage |
|:------:|:-------:|
| CPU Cache | Main Memory |
| Memory | Disk    |
| Local Disk | Network Storage |
