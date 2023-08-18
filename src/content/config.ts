import { defineCollection, z } from 'astro:content';

const bookmarks = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		url: z.string().url(),
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
			.transform((val) => new Date(val)),
		updatedDate: z
			.string()
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
		heroImage: z.string().optional(),
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
		posts: z.object({
			title: z.string(),
			url: z.string().url(),
		}).array().optional(),
	}),
});

export const collections = { bookmarks, posts, "starred-blogs": starredBlogs };
