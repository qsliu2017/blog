const TAG_LABELS: Record<string, string> = {
	database: 'Database',
	duckdb: 'DuckDB',
	postgres: 'Postgres',
};

export const tagSlug = (tag: string) =>
	tag
		.normalize('NFKD')
		.toLowerCase()
		.replace(/\+/g, '-plus')
		.replace(/#/g, '-sharp')
		.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
		.replace(/^-|-$/g, '');

export const tagLabel = (tag: string) => TAG_LABELS[tagSlug(tag)] ?? tag;

const plainTextFromMarkdown = (markdown: string) =>
	markdown
		.replace(/^\s*(?:import|export)\s.+$/gm, '')
		.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
		.replace(/^\s*[-*_]{3,}\s*$/gm, '')
		.replace(/^\s{0,3}(?:#{1,6}|>|[-*+] |\d+[.)] )\s*/gm, '')
		.replace(/[`*_~]/g, '')
		.replace(/\$+[^$]+\$+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const truncate = (text: string, maxLength: number) => {
	if (text.length <= maxLength) return text;
	const shortened = text.slice(0, maxLength + 1).replace(/\s+\S*$/, '').trim();
	return `${shortened || text.slice(0, maxLength).trim()}…`;
};

export const postDescription = (post: { data: { title?: string; description?: string }; body?: string }, maxLength = 160) => {
	const explicit = post.data.description?.trim();
	if (explicit) return truncate(explicit, maxLength);

	const bodyText = plainTextFromMarkdown(post.body ?? '');
	const title = post.data.title?.replace(/[`*_~]/g, '').trim();
	const text = title && bodyText.startsWith(title) ? bodyText.slice(title.length).trim() : bodyText;
	const sentences = text.match(/[^.!?。！？]+[.!?。！？]+(?:["'’”)]*)/g);
	const summary = sentences?.slice(0, 2).join(' ').trim() || text || post.data.title || '';
	return truncate(summary, maxLength);
};
