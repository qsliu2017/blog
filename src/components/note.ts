import { getCollection, type CollectionEntry } from 'astro:content';

export type NoteEntry = CollectionEntry<'notes'>;

export const normalizeId = (id: string) => id.toLowerCase().replace(' ', '-').replaceAll('_', '-');

export const getNotes = async () =>
	(await getCollection('notes'))
		.map(note => ({ page: note.data.page, note }))
		.reduce(
			(group, { page, note }) => ({
				...group,
				[page]: [note, ...(group[page] || [])],
			}),
			{} as { [K in NoteEntry['data']['page']]: NoteEntry[] },
		);
