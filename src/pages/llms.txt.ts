import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const posts = await getCollection('posts');
	const publishedPosts = posts
		.filter(post => !post.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	const site = context.site!.origin;

	const lines: string[] = [
		"# qsliu's blog",
		'',
		'> A personal blog about software engineering, systems programming, databases, and distributed systems.',
		'',
		`Site: ${site}`,
		`RSS: ${site}/rss.xml`,
		'',
		'## Posts',
		'',
		...publishedPosts.map(post => {
			const url = post.data.externalUrl ?? `${site}/post/${post.id}/`;
			const desc = post.data.description ? `: ${post.data.description}` : '';
			return `- [${post.data.title}](${url})${desc}`;
		}),
		'',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
