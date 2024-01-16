---
title: 'Safely Use Unsafe'
description: ''
date: 2024-01-15
tags: [Golang]
---

Recently I was working on fixing the issues reported by [CodeQL] in our codebase. [`WrongUsageOfUnsafe`](https://github.com/github/codeql/blob/main/go/ql/src/experimental/Unsafe/WrongUsageOfUnsafe.ql) is one of the rules that scans _casting between types with different memory sizes_. In this post, I will share why we need `unsafe` in our codebase and how to use it safely.

## `unsafe.Pointer`

In most usecases of Golang, casting the pointee type of a pointer (`*T -> *U`) is unnecessary. However, it is very common to represent a row by an array of raw bytes in database. In this usecase, the row type is unknown until the runtime. Thus we must get the raw pointer by `unsafe.Pointer`, and then convert its pointee type according to the metadata in the row.

The following code snippet gets a pointer of type `T` pointing to `offset` in the `raw` byte array.

```go
func ColumnAt(raw []byte, offset int) T {
    return *(*T)(unsafe.Pointer(&raw[offset]))
}
```

## What's Wrong With This Usage?

[CodeQL] reports the following warning for the above code snippet.

> Wrong usage of package unsafe
>
> Casting between types with different memory sizes can produce reads to memory locations that are after the target buffer, and/or unexpected values.

In fact, this rule checks if `sizeof T > sizeof U` in the scenario like `(*T)(unsafe.Pointer(*U))`. Let's browse the types in the above code snippet.

```text
 raw         -> []byte
 raw[offset] -> byte
&raw[offset] -> *byte
```

Since `byte` has the smallest size in Golang, the warning is reported for any type `T` other than `byte`.

## How to Fix It?

Now we know the problem is caused by the different size of `T` and `byte`. We can fix it by using a pointer of type `[SizeOfT]byte`. The following code snippet shows a straightforward way to do it.

```go
const SizeOfT = relfect.SizeOf(T)
func ColumnAt(raw []byte, offset int) T {
    arr := [SizeOfT]byte{}
    copy(arr[:], raw[offset:offset+SizeOfT])
    return *(*T)(unsafe.Pointer(&arr))
}
```

Since the size of `T` is the same as the size of `[SizeOfT]byte`, the warning is gone. However, this solution has a performance penalty. In the [benchmark] test, the above code costs 2x time than the original one. I guess the performance issue is caused by the addition operations: allocates a new array in the heap (create `arr`), copies the raw bytes to it (call `copy`), and then copy it to the stack again (dereference `&T`).

## How to Fix It Without Performance Penalty?

[Go 1.17](https://go.dev/doc/go1.17) introduces conversions from slice to array pointer, which does _not_ copy the underlying elements, instead reuses it. And Go runtime will check if the array pointer is out of bound.

We can use this type of conversions to avoid the redundant copy. As the following code snippet shows, we convert the raw byte array to a pointer of type `[SizeOfT]byte`. The warning is gone and the benchmark score is the same as the original one.

```go
const SizeOfT = relfect.SizeOf(T)
func ColumnAt(raw []byte, offset int) T {
    ptr := (*[SizeOfT]byte)(raw[offset:offset+SizeOfT])
    return *(*T)(unsafe.Pointer(ptr))
}
```

### More About Type Conversions in Golang

I do some [research](https://github.com/qsliu2017/wrong-usage-of-unsafe/blob/main/slice_test.go) on other type of conversions in Golang. One interests me:

```go
var s []byte // defined elsewhere
a := ([24]byte)(s)
```

Because of the experence in C/C++, I thought this conversion will cast the underlying slice struct to a `[24]byte` (Golang keeps track of a slice using a 24 bytes [`SliceHeader`](https://pkg.go.dev/reflect#SliceHeader)). Instead, the above code snippet creates a new `[24]byte` and copys the first 24 bytes of `s` to it. Actually, this kind of conversion from slice to array is introduced in [Go 1.20](https://go.dev/doc/go1.20).

[CodeQL]: https://github.com/github/codeql
[benchmark]: https://github.com/qsliu2017/wrong-usage-of-unsafe/blob/main/benchmark.txt
