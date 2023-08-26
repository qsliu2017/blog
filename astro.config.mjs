import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import { defineConfig } from 'astro/config';

/** old posts migrated from hugo */
const hugoPostsRedirects = [
  "how_to_make_developer_happy",
  "dont_use_chatgpt",
  "dont_use_chatgpt.zh",
  "random_display_a_html_element",
  "fibonacci",
  "writing_an_ebpf_application",
  "bpftrace_demo",
  "6.824lab2",
  "c_c++11_memory_model",
  "ebpf_and_application.zh",
  "trap_command_in_bash",
  "the-completely-fair-scheduler",
  "proc_sync_barrier_pattern",
  "oltp_olap_tuple_storage_schemes",
  "helloworld",
  "locality_principle",
  "os_history_and_future",
  "postgres-xid-wraparound-failure",
  "github_actions_demo",
]
  .map(slug => ({
    [`/posts/${slug}`]: `/post/${slug.replaceAll('.', '').replaceAll('+', '')}`,
  }))
  .reduce((acc, cur) => ({ ...acc, ...cur }), {})
  ;

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), tailwind()],
  experimental: {
    assets: true
  },
  redirects: {
    ...hugoPostsRedirects,
  },
});