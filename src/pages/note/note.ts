import { getCollection, type CollectionEntry } from 'astro:content';

export type NoteEntry = CollectionEntry<'notes'>;

export const normalizeId = (id: string) => id.toLowerCase().replace(' ', '-').replaceAll('_', '-');

export const getNotes = async () =>
	(await getCollection('notes'))
		.map(note => ({ id: normalizeId(note.data.id), note }))
		.reduce(
			(group, { id, note }) => ({
				...group,
				[id]: [note, ...(group[id] || [])],
			}),
			{} as { [K in NoteEntry['data']['id']]: NoteEntry[] },
		);
