---
title: Random Display A HTML Element
tags: [javascript, html, hugo]
date: 2023-03-28
---

Today I want to add a ***Listen Now*** section in my blog, to display a random song from my playlist. Spotify provides embed code for each song, for example:

```html
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5oO3drDxtziYU2H1X23ZIp?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
```

For simplicity, I want to use the code copied from Spotify directly.

## First Shot

I store the embed code in `data/playlist.toml`. It can be fetch by Hugo's `.Site.Data.playlist`.

```html
{{ $playlist := .Site.Data.playlist }}
```

Then I use Hugo's `shuffle` function to randomize the playlist and `range` function to display the first element.

```html
{{ $playlist := shuffle $playlist }}
{{ range first 1 $playlist }}
{{ . }}
{{ end }}
```

Save this snippet to `layouts/shortcodes/random.html` and use it in my blog.

```md
{{</* random */>}}
```

It looks great! It displays a random song from my playlist.

## But Wait,

It's not changed when I refresh the page. The output turns out just one `<iframe>` in the place of where shortcode `random` is. I guess it's because Hugo's functions are computed in the build time.

I want the song to change every time when I enter this page. So I write some `script` in the shortcode.

```html
{{$id := substr (md5 .Inner) 0 16 }}
<div id="{{$id}}">
  {{ .Inner }}
  <script>
    (() => {
      let dummy = document.getElementById("{{$id}}");
      let list = dummy.children;
      if (list.length > 0)
        dummy.replaceWith(list[Math.floor(Math.random() * (list.length - 1))]);
      else
        dummy.remove();
    })();
  </script>
</div>
```

The above code creates a dummy `<div>` with a random id, and put the `<iframe>` list inside it. Then a Javascript function runs to replace the dummy `<div>`(including the `<script>`) with one of these node.

Use it in the content:

```md
{{</* random */>}}
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5oO3drDxtziYU2H1X23ZIp?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3wFLWP0FcIqHK1wb1CPthQ?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0MMyJUC3WNnFS1lit5pTjk?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
{{</*/ random */>}}
```

It works!

{{< random >}}
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5oO3drDxtziYU2H1X23ZIp?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3wFLWP0FcIqHK1wb1CPthQ?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0MMyJUC3WNnFS1lit5pTjk?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
{{</ random >}}
