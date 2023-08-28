---
title: Migrate My Blog to Astro
date: 2023-08-28
tags: [Frontend,SSG,Hugo,Astro]
---

Several weeks ago, I found [Astro](https://astro.build). After hours of browsing, I decide to migrate my blog from Hugo to Astro.

## Why: Native & Modern Web Development

In Hugo, you write strange *Shortcodes* which is lack of language tool support and hard to understand.

Instead, Astro uses JavaScript/TypeScript and [JSX](https://react.dev/learn/writing-markup-with-jsx), just like React or Vue. Thus Astro can implement any frontend effects just as easy as others.

Enjoy the modern frontend developing experience!

## Redirect Old URL

I don't know if anyone share my post somewhere and someone click it after years but just find a 404. So making old URLs available is important. Astro's redirect config generates redirect page for all my post to its new URL.

```html
<!doctype html>
<title>Redirecting to: /post/writing_an_ebpf_application</title>
<meta http-equiv="refresh" content="0;url=/post/writing_an_ebpf_application">
<meta name="robots" content="noindex">
<link rel="canonical" href="/post/writing_an_ebpf_application">
<body>
	<a href="/post/writing_an_ebpf_application">Redirecting from <code>/posts/writing_an_ebpf_application/</code> to <code>/post/writing_an_ebpf_application</code></a>
</body>
```

## Next: Backend Service? Reaction?

[TBD]
