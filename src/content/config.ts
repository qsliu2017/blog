import { defineCollection, z } from 'astro:content';

const bookmarks = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		url: z.string().url(),
	}),
});

const notes = defineCollection({
	type: 'content',
	schema: z.object({
		page: z.string(),
		date: z
			.string()
			.or(z.date())
			.transform(val => new Date(val)),
	}),
});

const posts = defineCollection({
	type: 'content',
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

const songs = defineCollection({
	type: 'data',
	schema: z.object({
		src: z.string(),
	}),
});

const starredBlogs = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		url: z.string().url(),
		author: z.ostring(),
		comment: z.ostring(),
		tags: z.string().array().optional(),
		posts: z
			.object({
				title: z.string(),
				url: z.string().url(),
			})
			.array()
			.optional(),
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

export const collections = { bookmarks, notes, posts, songs, 'starred-blogs': starredBlogs, stars };
