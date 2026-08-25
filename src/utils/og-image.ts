import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_DESCRIPTION_LINES = 5;
const DESCRIPTION_LINE_LENGTH = 57;

const escapeXml = (value: string) =>
	value.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!);

const wrapText = (text: string, maxLines: number, lineLength: number) => {
	let remaining = text.trim().replace(/\s+/g, ' ');
	const lines: string[] = [];

	while (remaining && lines.length < maxLines) {
		if (remaining.length <= lineLength) {
			lines.push(remaining);
			remaining = '';
			break;
		}

		const candidate = remaining.slice(0, lineLength + 1);
		const lastSpace = candidate.lastIndexOf(' ');
		const breakAt = lastSpace >= lineLength * 0.6 ? lastSpace : lineLength;
		lines.push(remaining.slice(0, breakAt).trim());
		remaining = remaining.slice(breakAt).trim();
	}

	if (remaining && lines.length) lines[lines.length - 1] = `${lines.at(-1)!.replace(/[.,;:!?]?$/, '')}…`;
	return lines;
};

const commandLine = (command: string, y: number, fontSize = 30) =>
	`<text x="82" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="${fontSize}"><tspan fill="#5ac1fe">&gt;</tspan><tspan fill="#bfbdb6" xml:space="preserve"> ${escapeXml(command)}</tspan></text>`;

const renderArticleContent = (rawTitle: string, description: string) => {
	const title = rawTitle.replace(/`/g, '');
	const titleLines = wrapText(title, 2, 42);
	const descriptionLines = wrapText(description.replace(/`/g, ''), MAX_DESCRIPTION_LINES, DESCRIPTION_LINE_LENGTH);
	const firstTitleLine = titleLines[0] ?? title;
	const titleLineCount = Math.max(1, titleLines.length);
	const finalBaselineOffset = (titleLineCount - 1) * 36 + 62 + Math.max(0, descriptionLines.length - 1) * 46;
	const commandY = Math.round(HEIGHT / 2 - (finalBaselineOffset - 18) / 2);
	const descriptionStart = commandY + (titleLineCount - 1) * 36 + 62;
	const secondTitleLine = titleLines[1]
		? `<text x="401" y="${commandY + 36}" fill="#bfbdb6" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="28">${escapeXml(titleLines[1])}</text>`
		: '';

	return `
		<text x="82" y="${commandY}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="28">
			<tspan fill="#5ac1fe">qsliu:~/blog</tspan><tspan fill="#8a8986" xml:space="preserve"> &gt; cat </tspan><tspan fill="#bfbdb6">${escapeXml(firstTitleLine)}</tspan>
		</text>
		${secondTitleLine}
		${descriptionLines.map((line, index) => `<text x="82" y="${descriptionStart + index * 46}" fill="#bfbdb6" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="30">${escapeXml(line)}</text>`).join('\n')}`;
};

const renderListContent = () => `
	${commandLine('pwd', 120)}
	<text x="82" y="166" fill="#bfbdb6" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="30">qsliu&apos;s blog</text>

	${commandLine('ls', 242)}
	<text x="82" y="288" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="30" xml:space="preserve"><tspan fill="#5ac1fe">databases/</tspan><tspan fill="#bfbdb6"> </tspan><tspan fill="#5ac1fe">systems/</tspan><tspan fill="#bfbdb6"> </tspan><tspan fill="#5ac1fe">software_engineering/</tspan></text>`;

export const generateOgImage = async ({ title, description, includeArticle }: { title: string; description: string; includeArticle: boolean }) => {
	const content = includeArticle ? renderArticleContent(title, description) : renderListContent();
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
			<rect width="${WIDTH}" height="${HEIGHT}" fill="#0d1016" />
			<rect x="38" y="38" width="1124" height="554" rx="24" fill="#141820" stroke="#2d2f34" stroke-width="2" />
			${content}
		</svg>`;

	return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
};
