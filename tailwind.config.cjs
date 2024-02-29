/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.astro'],
	darkMode: ['selector', '[data-mode="dark"]'],
	theme: {
		extend: {
			fontFamily: {
				DEFAULT: ['Zed-sans', 'Open Sans', 'sans-serif'],
				heading: ['Zed-sans', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
			},
			width: {
				main: '65ch',
			},
			backgroundColor: {
				DEFAULT: 'var(--color-background)',
				inactive: 'var(--color-background)',
				main: 'var(--color-editor-background)',
				active: 'var(--color-editor-active-line-background)',
			},
			textColor: {
				DEFAULT: 'var(--color-text)',
				disabled: 'var(--color-text-disabled)',
				inactive: 'var(--color-editor-line-number)',
				active: 'var(--color-editor-active-line-number)',
			},
			borderColor: {
				DEFAULT: 'var(--color-border)',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		({ matchUtilities, theme }) => {
			matchUtilities(
				{
					'overlay-border-b': value => ({
						position: 'relative',
						'&::after': {
							position: 'absolute',
							width: '100%',
							height: value,
							'background-color': 'inherit',
							left: '0',
							bottom: `-${value}`,
							content: '""',
						},
					}),
				},
				{ values: theme('borderWidth') },
			);
		},
	],
};
