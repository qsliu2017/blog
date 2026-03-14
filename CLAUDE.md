# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with **Astro 5** (static site generation), deployed to **Cloudflare Pages**. Uses Bun as the package manager.

Site URL: `https://blog.qsliu.dev`

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (astro dev)
bun run build        # Production build (injects git commit hash into PUBLIC_GIT_COMMIT_HASH)
bun run preview      # Preview production build
bun run format       # Prettier (tabs, 150 char width)
```

Scaffold a new post:
```bash
bash script/create-post "post-title"
```

## Architecture

### Content System

Blog posts live in `src/content/posts/` as `.md` or `.mdx` files. The content collection is defined in `src/content/config.ts`.

**Post frontmatter schema:**
```yaml
title: string        # required
description: string  # optional
date: string | Date  # required
tags: string[]       # default: []
draft: boolean       # default: false
theme: 'default' | 'tufte'  # default: 'default', selects which layout renders the post
externalUrl: URL     # optional, for link-style posts
```

Posts can be either a single file (`my-post.md`) or a directory with `index.md`/`index.mdx`. MDX posts can import custom components like `CodeBlock.astro`.

A second collection, `stars` (`src/content/stars/`), stores curated bookmarks as JSON arrays.

### Routing & Themes

Pages in `src/pages/` use Astro dynamic routes:
- `[...page].astro` — renders posts with `theme: 'default'`
- `[...tufte].astro` — renders posts with `theme: 'tufte'` (sidenote-style layout)
- `[...list].astro` — post listing, tag filtering (`/tagged/[tag]/`), and stars page (`/star`)

The theme field in frontmatter determines which page template renders the post. Each theme has its own CSS (`global.css` for default, `tufte.css` for tufte).

Hugo-era redirects from `/posts/` to `/post/` are configured in `astro.config.mjs`.

### Styling

- **Tailwind CSS 3** with `@tailwindcss/typography` plugin
- Custom "ayu" color scheme (from Zed editor) defined as CSS custom properties in `src/styles/global.css`
- Dark mode via `[data-mode="dark"]` data attribute on `<html>`, toggled by script in `Head.astro`
- Custom fonts: Zed Sans / Zed Mono, preloaded from `/public/fonts/`
- Custom Tailwind value: `w-main` = `80ch` (main content width), defined in `tailwind.config.cjs`
- Blog content styling uses `.rendered-content` class with CSS-generated heading markers (`#`, `##`) and line-numbered code blocks

### Key Components

- `Head.astro` — meta tags, fonts, dark mode script, global CSS
- `Nav.astro` — breadcrumb navigation
- `Footer.astro` — copyright, links, git commit hash
- `CodeBlock.astro` — code block wrapper with optional line number hiding (`no_lineno` prop)

### Content Processing Pipeline

Configured in `astro.config.mjs`:
- `remark-math` + `rehype-mathjax` for LaTeX math rendering (`$...$` inline, `$$...$$` display)
- Astro's built-in Shiki for code syntax highlighting
- Auto-generated headings used for sticky table-of-contents sidebar (with IntersectionObserver-based active tracking)

### Important Paths

- `src/content/posts/` — **main content directory** (most work happens here)
- `src/styles/global.css` — theme variables and post styling
- `src/styles/tufte.css` — tufte theme styles
- `astro.config.mjs` — Astro config, redirects, markdown plugins
- `tailwind.config.cjs` — custom Tailwind extensions
- `wrangler.toml` — Cloudflare deployment config
