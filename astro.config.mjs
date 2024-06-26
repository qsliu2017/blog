import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypeMathjax from 'rehype-mathjax/chtml';
import remarkMath from 'remark-math';

/** old posts migrated from hugo */
const hugoPostsRedirects = [
	'how_to_make_developer_happy',
	'dont_use_chatgpt',
	'random_display_a_html_element',
	'fibonacci',
	'writing_an_ebpf_application',
	'bpftrace_demo',
	'6.824lab2',
	'c_c++11_memory_model',
	'ebpf_and_application.zh',
	'trap_command_in_bash',
	'the-completely-fair-scheduler',
	'proc_sync_barrier_pattern',
	'oltp_olap_tuple_storage_schemes',
	'locality_principle',
	'os_history_and_future',
	'postgres-xid-wraparound-failure',
	'github_actions_demo',
]
	.map(slug => ({
		[`/posts/${slug}`]: `/post/${slug.replaceAll('.', '').replaceAll('+', '')}`,
	}))
	.reduce((acc, cur) => ({ ...acc, ...cur }), {});
// https://astro.build/config
export default defineConfig({
	site: 'https://blog.qsliu.dev',
	integrations: [mdx(), tailwind({ applyBaseStyles: false })],
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [[rehypeMathjax, { chtml: { fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2' } }]],
	},
	assets: true,
	redirects: { ...hugoPostsRedirects },
});
