import { getCollection, type CollectionEntry } from 'astro:content';

export type NoteEntry = CollectionEntry<'notes'>;

export const normalizeId = (id: string) => id.toLowerCase().replace(' ', '-').replaceAll('_', '-');

export const getNotes = async () => Object.groupBy(await getCollection('notes'), note => note.data.page);
