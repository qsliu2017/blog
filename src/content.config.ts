import { file, glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ pattern: '{[!_]*,*/index}.{md,mdx}', base: './src/content/posts' }),
	// type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		// Transform string to Date object
		date: z
			.string()
			.or(z.date())
			.transform(val => new Date(val)),
		tags: z.string().array().default([]),
		draft: z.boolean().default(false),
		theme: z.enum(['default', 'tufte']).default('default'),
		externalUrl: z.url().optional() /* if present, display as an external link */,
	}),
});

// stars.toml is a TOML object: each top-level key becomes a collection entry (id=key, data=value)
// Structure: { bookmarks: { entry: [...] }, blogs: { entry: [...] } }
const stars = defineCollection({
	loader: file('src/content/stars.toml'),
	schema: z.object({
		entry: z
			.object({
				title: z.string(),
				url: z.url(),
				posts: z.optional(
					z.array(
						z.object({
							title: z.string(),
							url: z.url(),
						}),
					),
				),
			})
			.array(),
	}),
});

export const collections = { posts, stars };
