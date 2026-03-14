import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
	loader: glob({ pattern: '{[!_]*,*/index}.{md,mdx}', base: './src/content/posts' }),
	// type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.ostring(),
		// Transform string to Date object
		date: z
			.string()
			.or(z.date())
			.transform(val => new Date(val)),
		tags: z.string().array().default([]),
		draft: z.boolean().default(false),
		theme: z.enum(['default', 'tufte']).default('default'),
		externalUrl: z.string().url().optional() /* if present, display as an external link */,
	}),
});

const stars = defineCollection({
	type: 'data',
	schema: z
		.object({
			title: z.string(),
			url: z.string().url(),
			posts: z.optional(
				z.array(
					z.object({
						title: z.string(),
						url: z.string().url(),
					}),
				),
			),
		})
		.array(),
});

export const collections = { posts, stars };
