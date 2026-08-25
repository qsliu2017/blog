import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypeMathjax from 'rehype-mathjax/chtml';
import remarkMath from 'remark-math';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.qsliu.dev',
	integrations: [mdx(), tailwind({ applyBaseStyles: false }), sitemap()],
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [[rehypeMathjax, { chtml: { fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2' } }]],
	},
	assets: true,
});
