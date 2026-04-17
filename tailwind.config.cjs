/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.astro'],
	darkMode: ['selector', '[data-mode="dark"]'],
	theme: {
		extend: {
			width: {
				main: '80ch',
			},
			maxWidth: {
				main: '80ch',
			},
			textColor: {
				DEFAULT: 'var(--color-text)',
				muted: 'var(--color-text-muted)',
				active: 'var(--color-editor-active-line-number)',
			},
			borderColor: {
				DEFAULT: 'var(--color-border)',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
