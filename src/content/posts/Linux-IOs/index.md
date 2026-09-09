---
title: 'Linux IOs'
date: 2025-05-17
updated_at: 2026-09-09
tags: [io_uring, Linux]
---

**2026-09-09 Updated**: Add `mmap` and page cache.

PostgreSQL [18 Beta 1][pg18beta1] introduced asynchronous I/O, with `io_uring` as one implementation on Linux. In this post, I want to briefly compare different types of Linux I/O syscalls and explore how `io_uring` can enhance data-sensitive applications.

## `read`/`write`

[`read`][read] and [`write`][write] are the basic syscalls for performing I/O. For example, `read` asks the kernel to read up to `count` bytes from a file or socket associated with a given `fd`, and copy the data to `buf` in user space.

```c
ssize_t read(int fd, void buf[.count], size_t count);
ssize_t write(int fd, const void buf[.count], size_t count);
```

### Page Cache and `O_DIRECT`

Given an ordinary file opened without `O_DIRECT`, `read` first looks for the requested data in the kernel page cache. On a miss, the storage device fills the page cache, normally using DMA, and the kernel then copies the data to the user buffer.

`write` copies data from the user buffer into the page cache and marks the pages dirty. It can return before the data reaches storage. An application must use `fsync`/`fdatasync` when durability is required.

Opening a file with `O_DIRECT` requests I/O that bypasses the page cache. The user buffer, file offset, and length must meet filesystem-specific alignment requirements; invalid requests usually fail with `EINVAL`, though some filesystems fall back to buffered I/O. `O_DIRECT` neither guarantees zero-copy I/O nor provides durability.

These syscalls have two major shortcomings:

1. Each operation requires a transition between user and kernel mode, and blocking may also cause a scheduler context switch.
2. Buffered I/O copies data between a kernel buffer and the user buffer. Files use the page cache, while sockets use socket buffers.

## IO multiplexing

The main idea behind I/O multiplexing is to group a set of file descriptors (fds) and use a single syscall to monitor I/O events. The application still calls `read`/`write` after an fd becomes ready.

`epoll` is the Linux-specific implementation of I/O multiplexing. Relevant syscalls are listed and described below:

```c
// creates a new epoll instance, returns an epfd representing it
int epoll_create1(int flags);

// add, modify, or remove entries in the interest list of the epoll instance
int epoll_ctl(int epfd, int op, int fd,
                struct epoll_event *_Nullable event);

// waits for events on the epoll instance
int epoll_wait(int epfd, struct epoll_event events[.maxevents],
                int maxevents, int timeout);
```

`epoll` only reports readiness, so it does not change the page-cache behavior of later I/O. Ordinary disk files are always ready thus cannot be added to epoll. So it is mainly used for sockets and pipes. For example, the Go runtime uses a single epoll instance for its network poller on Linux.

### `select` vs. `epoll`

[`select`][select] uses `fd_set` to maintain a group of fds. Each call scans the whole descriptor sets, resulting in O(n) work.

```c
int select(int nfds, fd_set *_Nullable restrict readfds,
            fd_set *_Nullable restrict writefds,
            fd_set *_Nullable restrict exceptfds,
            struct timeval *_Nullable restrict timeout);
```

`epoll` instead maintains an interest set and a ready list. It registers callbacks with wait queues exposed by each fd. As a result, `epoll_wait` takes time proportional to the number of returned events instead of scanning the entire set.

`epoll` generally performs better for large descriptor sets on Linux, while `select` remains useful for portability or small sets.

## `io_uring`: batched asynchronous I/O

The main idea behind [`io_uring`][io_uring] is to communicate I/O requests and completions through shared memory. This allows batching and reduces syscall overhead, but does not by itself avoid copying file data.

[`io_uring_setup`][io_uring_setup] creates an io_uring context. User space then maps a submission queue (SQ), a completion queue (CQ), and a separate array of submission queue entries (SQEs). The queues use a lockless protocol, although io_uring as a whole is not necessarily lock-free.

Normally, the user adds SQEs and calls `io_uring_enter` to submit them. The kernel processes the requests and adds completion queue entries (CQEs), which the user can read from the CQ. The same syscall can wait for completions, so busy polling is optional.

With `IORING_SETUP_SQPOLL`, a kernel thread polls the SQ and many submissions need no syscall. Otherwise, io_uring reduces syscalls mainly by batching them. It supports both file and network I/O.

Its data path follows the operation and fd: buffered file I/O uses the page cache, while a file opened with `O_DIRECT` requests direct I/O. PostgreSQL 18 uses io_uring for asynchronous buffered relation reads, so data still moves from storage to the page cache and then to a PostgreSQL buffer.

## `mmap`

[`mmap`][mmap] maps file content into a process's virtual address space. Accessing a page that is not resident causes a page fault. A page-cache hit causes a minor fault; a miss loads the page from storage and causes a major fault.

```c
void *mmap(void *addr, size_t length, int prot, int flags,
           int fd, off_t offset);
```

File-backed `mmap` normally uses the page cache, but maps its pages into the process instead of copying them to a separate user buffer. `O_DIRECT` does not change this behavior.

Writes depend on the mapping flag:

- With a writable `MAP_SHARED` mapping, a store modifies the page-cache page and marks it dirty. `msync(..., MS_SYNC)` waits for dirty pages in the specified range to be written.
- With `MAP_PRIVATE`, writes use copy-on-write and do not update the file.

PostgreSQL used `mmap` for shared-memory allocation before version 18, but it did not normally map table or index files. It read relation pages through the page cache into `shared_buffers`.

---

1. [What is io_uring?](https://unixism.net/loti/what_is_io_uring.html) has a good description of the io_uring mental model.
1. [golang/go#65064](https://github.com/golang/go/issues/65064) discusses how the singleton epoll instance in the Go runtime could become a scalability problem, and explores whether io_uring could replace it.
1. The first section of [Efficient IO with io_uring](https://kernel.dk/io_uring.pdf) introduces [AIO](https://man7.org/linux/man-pages/man7/aio.7.html), a failed async I/O interface and predecessor of io_uring.
1. [How io_uring and eBPF Will Revolutionize Programming in Linux](https://www.scylladb.com/2020/05/05/how-io_uring-and-ebpf-will-revolutionize-programming-in-linux/) presents a use case of io_uring in ScyllaDB and includes a detailed performance comparison.

   Fun fact: I first came across Linus Torvalds’s [complaint](https://lwn.net/Articles/671657/) about AIO in this post.

   > So I think this is ridiculously ugly. AIO is a horrible ad-hoc design...

[pg18beta1]: https://www.postgresql.org/about/news/postgresql-18-beta-1-released-3070/
[read]: https://man7.org/linux/man-pages/man2/read.2.html
[write]: https://man7.org/linux/man-pages/man2/write.2.html
[open]: https://man7.org/linux/man-pages/man2/open.2.html
[select]: https://man7.org/linux/man-pages/man2/select.2.html
[io_uring]: https://man7.org/linux/man-pages/man7/io_uring.7.html
[io_uring_setup]: https://man7.org/linux/man-pages/man2/io_uring_setup.2.html
[mmap]: https://man7.org/linux/man-pages/man2/mmap.2.html
