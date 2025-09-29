
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import htmlMinifier from 'vite-plugin-html-minifier';
import tailwindcss from '@tailwindcss/vite';

const minify = {
	collapseWhitespace: true,
	keepClosingSlash: true,
	removeComments: false,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	removeEmptyAttributes: true,
	useShortDoctype: true,
	minifyCSS: true,
	minifyJS: true,
	minifyURLs: true,
};

const base = (process?.env?.viteEnv || 'production') === 'github'
	? 'pages.github.io/tweenn/pdf-splitter'
	: '';

export default defineConfig({
	plugins: [
		preact(),
		tailwindcss(),
		htmlMinifier({
			minify
		})
	],
	root: './src/',
	envDir: '../',
	base,
	build: {
		target: 'esnext',
		outDir: '../dist/',
		rollupOptions: {
			input: {
				'main': 'src/index.html'
			},
			watch: {
				chokidar: {
					usePolling: true
				}
			},
		}
	},
	worker: {
		format :'es'
	}
});
