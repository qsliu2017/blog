---
title: "All's Well That Ends Well"
description: 'This post introduces a common pattern in Go, which is useful when several concurrent tasks want to be canceled when any of them failed.'
date: 2024-03-02
tags: [Golang, Code Snippet]
---

## Scenario

A job consists of several tasks, each of which can process independently.
The main goroutine starts these tasks in their own goroutine and waits all of them done.
The main goroutine might also accepts error from any of these tasks, and then cancels the other tasks.

_Punchline_: "All's well that ends well" means "if that ends well, then all is well", which is logical equivalent to "if not all is well, then that does not end well".

## Snippet

In the following snippet, `sync.WaitGroup` is used for waiting all tasks done, and `context.WithCancel()` for creating a cancellable context. Only when the context is cancelled, the `<-ctx.Done()` will return (channel closed).

```go
var wg sync.WaitGroup
ctx, cancel := context.WithCancel(context.Background())

tasks := []func(context.Context) error{ /* ... */ }

for _, task := range tasks {
    wg.Add(1)
    go func(t func(context.Context) error) {
        defer wg.Done()
        if err := t(ctx); err != nil {
            cancel()
        }
    }(task)
}

wg.Wait()
```

A task should check if the context is cancelled, and return immediately if so.

On error, the task should call the `cancel` function of the common context, thus cancelling all other tasks.
Since we call `cancel` on the function literal above, it is equivalent to returning an error in the following snippet.

```go
func task(ctx context.Context) error {

    /* ... */

    // on each step, check if the context is cancelled
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
    }

    // on error, return immediately
    return err
}
```

## _#Today-I-Learned_

1. `cancel()` is idempotent (i.e. it is safe to call more than once). The first call to `cancel()` cancels the context, and subsequent calls do nothing.

1. With [`context.WithCancelCause()`](https://pkg.go.dev/context#WithCancelCause) (added in Go 1.20), a error can be attached to the cancelled context, and retrieved by calling [`context.Cause()`](https://pkg.go.dev/context#Cause). See the following example from the docs.

   ```go
   ctx, cancel := context.WithCancelCause(parent)
   cancel(myError)
   ctx.Err() // returns context.Canceled
   context.Cause(ctx) // returns myError
   ```

1. Be well in with Google. Follow their [usage of `context`](https://go.dev/blog/context). **TL;DR**, follow the rule below.

   > pass a `Context` parameter as the first argument to every function on the call path
