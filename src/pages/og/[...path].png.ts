import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../utils/og-image';
import { postDescription } from '../../utils/seo';

type Props = {
	title: string;
	description: string;
	includeArticle: boolean;
};

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('posts');
	const articleImages = posts
		.filter(post => !post.data.externalUrl)
		.map(post => ({
			params: { path: `post/${post.id}` },
			props: { title: post.data.title, description: postDescription(post, 280), includeArticle: true } satisfies Props,
		}));
	return [
		{ params: { path: 'index' }, props: { title: "qsliu's blog", description: '', includeArticle: false } satisfies Props },
		...articleImages,
	];
};

export const GET: APIRoute<Props> = async ({ props }) => {
	const image = await generateOgImage(props);
	return new Response(new Uint8Array(image), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
