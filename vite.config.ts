
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import htmlMinifier from 'vite-plugin-html-minifier';
import { viteStaticCopy } from 'vite-plugin-static-copy';
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
	? 'teg-individualicao-agua'
	: '';

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'bin/gs-worker.wasm',
					dest: 'assets',
				},
			]
		}),
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
