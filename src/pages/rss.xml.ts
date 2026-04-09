import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const posts = await getCollection('posts');
	const publishedPosts = posts
		.filter(post => !post.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	return rss({
		title: "qsliu's blog",
		description: "A blog about software engineering, systems programming, databases, and distributed systems.",
		site: context.site!,
		items: publishedPosts.map(post => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.description ?? '',
			link: post.data.externalUrl ?? `/post/${post.id}/`,
			categories: post.data.tags,
		})),
	});
}
