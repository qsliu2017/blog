---
title: 'Linux IOs'
description: ''
date: 2025-05-17
tags: [io_uring, Linux]
---

Days ago, PostgreSQL [18beta1][pg18beta1] introduced Linux’s `io_uring` to increase I/O throughput. In this post, I want to briefly compare different types of Linux I/O syscalls and explore how `io_uring` can enhance data-sensitive applications.

## `read`/`write`

[`read`][read] and [`write`][write] are the basic syscalls for performing I/O. For example, `read` asks the kernel to read `count` bytes from a file or socket associated with a given `fd`, and copy the data to `buf` in user space.

```c
ssize_t read(int fd, void buf[.count], size_t count);
ssize_t write(int fd, const void buf[.count], size_t count);
```

These syscalls have two major shortcomings:

1. `read` operations on each individual file or socket cause a large number of context switches between kernel mode and user mode;
1. Data is copied twice (disk/network → kernel space → user space).

## IO multiplexing

The main idea behind I/O multiplexing is to group a set of file descriptors (fds) and use a single syscall to monitor I/O events. This approach addresses the first issue mentioned above.

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

`epoll` is widely used in high-performance applications, frameworks, and runtimes. For example, the Go runtime internally uses a single epoll instance to perform all I/O operations.

### `select` vs. `epoll`

In earlier versions of Linux, [`select`][select] was used for I/O multiplexing. `select` uses `fd_set` to maintain a group of fds. Internally, each `select` call polls all fds, resulting in O(n) time complexity.

```c
int select(int nfds, fd_set *_Nullable restrict readfds,
            fd_set *_Nullable restrict writefds,
            fd_set *_Nullable restrict exceptfds,
            struct timeval *_Nullable restrict timeout);
```

`epoll` instead maintains a ready list. When a fd is added to an epoll instance, a callback is registered with the device driver for that fd, which is responsible for updating the ready list upon I/O events. As a result, retrieving events takes O(1) time.

Since `select` has more limitations and worse performance compared to `epoll`, all applications should use `epoll` instead of `select` today.

## `io_uring`: one syscall and zero-copy

The main idea behind [`io_uring`][io_uring] is to communicate I/O requests and responses between kernel space and user space through **shared memory**, instead of using syscalls. This avoids data copying and reduces context switches.

Specifically, two ring buffers are shared: one for submitting I/O requests (the submission queue, SQ) and the other for receiving completion events (the completion queue, CQ). [`io_uring_setup`][io_uring_setup] is called to set up these two ring buffers.

An I/O operation is handled as follows: (1) The user pushes submission queue entries (SQEs) to the tail of the SQ; (2) The kernel polls the SQ, processes the requests, and appends completion queue entries (CQEs) to the tail of the CQ; (3) Finally, the user polls the CQ to retrieve and handle the completed results.

Theoretically, only one syscall, [io_uring_setup][io_uring_setup], is needed in this I/O model. However, this programming model follows a polling style, which can lead to busy waiting if I/O events are infrequent. So far, I have mainly seen use cases and proposals involving disk I/O.

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
