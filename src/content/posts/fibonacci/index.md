---
title: Fibonacci O(log n) solution
date: 2023-03-14
math: true
---

Fibonacci is defined as following.

$$
f(n) = \begin{cases}
0,& n=0 \\
1,& n=1 \\
f(n-1) + f(n-2),& n >= 2
\end{cases}
$$

The following eqution can be proved.

$$
\begin{vmatrix}
  f(n) & f(n-1) \\
  f(n-1) & f(n-2) \\
\end{vmatrix}=
\begin{vmatrix}
  1 & 1 \\
  1 & 0 \\
\end{vmatrix}^{n-1}
$$

> (Prove by induction)
>
> 1. When $n=2$
>
> $$
> \begin{vmatrix}
>   f(2) & f(1) \\
>   f(1) & f(0) \\
> \end{vmatrix}=
> \begin{vmatrix}
>   1 & 1 \\
>   1 & 0 \\
> \end{vmatrix}
> $$
>
> 2. Suppose it satisfy for $n$, then for $n+1$
>
> $$
> \begin{aligned}
> \begin{vmatrix}
>   f(n+1) & f(n) \\
>   f(n) & f(n-1) \\
> \end{vmatrix}
> &=\begin{vmatrix}
>   f(n) + f(n-1) & f(n) \\
>   f(n-1) + f(n-2) & f(n-1) \\
> \end{vmatrix}\\
> &=\begin{vmatrix}
>   f(n) & f(n-1) \\
>   f(n-1) & f(n-2) \\
> \end{vmatrix}\cdot
> \begin{vmatrix}
>   1 & 1 \\
>   1 & 0 \\
> \end{vmatrix}\\
> &=\begin{vmatrix}
>   1 & 1 \\
>   1 & 0 \\
> \end{vmatrix}^n
> \end{aligned}
> $$

To compute $f(n)$, we can just compute
$\begin{vmatrix}
  1 & 1 \\
  1 & 0 \\
\end{vmatrix}^{n-1}$.
This can be done in $\text{O}(\log n)$ since

$$
a^n = \begin{cases}
a^{n/2}\cdot a^{n/2} & a\text{ is even} \\
a^{(n-1)/2}\cdot a^{(n-1)/2}\cdot a & a\text{ is odd}
\end{cases}
$$

A Golang version code can be found in my [GitHub](https://github.com/qsliu2017/fibonacci). In my test, this solution is way more fast than the $\text{O}(n)$ version.

```plaintext
$ go test -bench '^BenchmarkFibonacci(2|3)$'
goos: darwin
goarch: arm64
pkg: fibonacci
BenchmarkFibonacci2-8           382967418                4.912 ns/op
BenchmarkFibonacci3-8           1000000000               0.0000004 ns/op
PASS
ok      fibonacci       2.892s
```
