---
title: Writing an eBPF Application
date: 2023-03-08
tags: [eBPF]
---

In this post, we will write a native eBPF application using [`libbpf`](https://github.com/libbpf/libbpf).

## Prerequisites

- A Linux system with `bpf` enabled.
- Linux headers installed.
  
  For most Linux distributions, install `linux-headers-$(uname -r)` in the package manager.
- `libbpf` installed.

## eBPF Application Components

An eBPF application consists of two main components: (1)a user program running in the user space and (2)an eBPF program running in the kernel space. When the user program is terminated, all eBPF programs it created will be destroyed.

![eBPF applications components](ebpf_applications_components.excalidraw.png)

The eBPF program is compiled to the bpf target, while the user program should be compiled to the machine target.

The Linux header files `<linux/bpf.h>` and `<bpf/bpf_helpers.h>` are required in the eBPF program to call helper functions and access maps. The libbpf library is useful in the user program as it wraps the Linux system call `bpf`.

The user program can be written in Rust or Go via their [libbpf-rs](https://github.com/libbpf/libbpf-rs) and [cilium/ebpf](https://github.com/cilium/ebpf) libraries, respectively. However, eBPF programs are usually written in C.

## Kernel Side

We write a simple eBPF program that prints log when `do_nanosleep` is called.

```C
#include <linux/bpf.h>

#include <bpf/bpf_helpers.h>

char LICENSE[] SEC("license") = "GPL";

SEC("kprobe/do_nanosleep")
int helloworld(void *ctx) {
  const char greet[] = "Hello World!";
  bpf_trace_printk(greet, sizeof(greet));
  return 0;
}
```

The main part of this program is `int helloworld(void *ctx)`. `SEC("kprobe/do_nanosleep")` indicates that this function (or *program*) will be attached to kernel probe `do_nanosleep`. For a complete list of kprobe, run `cat /proc/kallsyms`.

Notice that `SEC("license")` is essential for this program. Because some helper functions are only accessible to programs that are compatible with the GNU Privacy License (GPL). In order to use such helpers, the eBPF program must be loaded with the correct license string.

Next, we need to compile our eBPF program. We can use the following command to compile the program to the bpf target. This will create an object file `hello_world.bpf.o` that we will use later.

```sh
clang \
  -target bpf \
  -g -O2 \
  -o hello_world.bpf.o \
  -c hello_world.bpf.c
```

## User-Space Side

We then write a simple user program to load the bpf program.

```C
#include <bpf/libbpf.h>
#include <stdio.h>

static int libbpf_print(enum libbpf_print_level level, const char *s,
                        va_list ap) {
  return vfprintf(stderr, s, ap);
}

int main() {
  libbpf_set_print(libbpf_print);

  struct bpf_object *obj = bpf_object__open_file("hello_world.bpf.o", NULL);

  bpf_object__load(obj);

  struct bpf_program *prog =
      bpf_object__find_program_by_name(obj, "helloworld");

  struct bpf_link *link = bpf_program__attach(prog);

  for (;;)
    ;

  bpf_link__destroy(link);

  bpf_object__close(obj);
}
```

This program is too easy to include error handling. It is just to show the lifecycle of the bpf program.

First, `bpf_object__open_file` opens the binary file and loads the bpf instruments.

Second, `bpf_object__load` loads the bpf instruments into kernel. At this step, kernel does the verification.

Next, `bpf_object__find_program_by_name` finds the function `helloworld` and then `bpf_program__attach` actually attach this function to the probe.

We can browse the output of the bpf program by the following command.

```sh
sudo cat /sys/kernel/debug/tracing/trace
```

You shall see:
```sh
sudo cat /sys/kernel/debug/tracing/trace
# tracer: nop
#
# entries-in-buffer/entries-written: 129/129   #P:2
#
#                                _-----=> irqs-off/BH-disabled
#                               / _----=> need-resched
#                              | / _---=> hardirq/softirq
#                              || / _--=> preempt-depth
#                              ||| / _-=> migrate-disable
#                              |||| /     delay
#           TASK-PID     CPU#  |||||  TIMESTAMP  FUNCTION
#              | |         |   |||||     |         |
 google_osconfig-468     [001] d...1 793281.115931: bpf_trace_printk: Hello World!
            node-214047  [000] d...1 793281.165218: bpf_trace_printk: Hello World!
      multipathd-215     [000] d...1 793281.745970: bpf_trace_printk: Hello World!
 google_guest_ag-193457  [000] d...1 793281.828999: bpf_trace_printk: Hello World!
           sleep-215469  [000] d...1 793282.063177: bpf_trace_printk: Hello World!
            node-214047  [000] d...1 793282.165268: bpf_trace_printk: Hello World!
 google_guest_ag-193457  [000] d...1 793282.729843: bpf_trace_printk: Hello World!
```

## Conclusion

In this post, we implement a simple eBPF program having the same function as in the last post [*bpftrace demo*](../bpftrace_demo). Even though using tools and infrastructures like bpftrace is a better choice for simple application and prototyping, understand the native ebpf is sometime the only road left for developers who want to implement a brand new function or a performance-sensitive application.

## References

- [Linux manual page](https://man7.org/linux/man-pages/man7/bpf-helpers.7.html) lists all of the eBPF helper functions
- [libbpf API document](https://libbpf.readthedocs.io/en/latest/api.html) separetes ebpf application lifecycle group by a few logical types.
