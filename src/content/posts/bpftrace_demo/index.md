---
title: '`bpftrace` demo'
date: 2023-02-18
tags: [eBPF, bpftrace]
---

In this post, we will use `bpftrace` to showcase the capabilities of eBPF.

## Prerequisites

- A Linux system with `bpf` enabled.

  Note that Docker environments do not support bpf. If you are using MacOS, a VM is a good alternative, [GCP Spot](https://cloud.google.com/spot-vms) for example.

- `bpftrace` installed.

  For Ubuntu, you can simply run `sudo apt-get install -y bpftrace`. For other Linux distributions, please refer to [install guide](https://github.com/iovisor/bpftrace/blob/master/INSTALL.md#package-install).

## When We All Fall Asleep...

Let's start with a basic bpftrace command:

```sh
bpftrace -e 'kprobe:do_nanosleep { printf("%d is falling asleep\n", pid); }'
```

When you run this command, you will see the following output:

```txt
Attaching 1 probe...
209 is falling asleep
209 is falling asleep
209 is falling asleep
451 is falling asleep
209 is falling asleep
451 is falling asleep
^C
```

What is happening here? The `bpftrace` script follows the syntax `probe { action }`. In this case, the command triggers a `printf` action (similar to C) whenever the `kprobe:do_nanosleep` event occurs.

There are several kinds of probes available. For example, `kprobe:do_sys_open` can be used to trace when the system call `open` is executed. A complete list of probes can be found in the [reference guide](https://github.com/iovisor/bpftrace/blob/master/docs/reference_guide.md#probes).

## Tracing User Probes

In addition to kernel functions, `bpftrace` can also trace user functions. Let's write a simple C program and compile it to `/root/a.out`.

```C
#include <stdlib.h>
void increment(int *p) { (*p)++; }
int main() {
	int v = 0;
	for (int i = 0; i < 10; i++)
		increment(&v);
	return 0;
}
```

Next, let's set up a `bpftrace` command to trace the `increment` function:

```sh
bpftrace -e 'uprobe:/root/a.out:increment { printf("increment %p\n", arg0); }'
```

Now, run the program in another terminal window. You should see output similar to the following in the terminal running `bpftrace`:

```txt
Attaching 1 probe...
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
increment 0x7ffc6c4b3658
^C
```

## Conclusion

In this post, we have shown some basic usage of `bpftrace` to trace eBPF events. It is worth noting that tracing is just a subset of all the functions that eBPF can perform.
