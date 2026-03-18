// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://hashturn.com',
	output: 'static',
	adapter: vercel(),
	integrations: [
		mdx(),
		sitemap({
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date(),
			customPages: [],
			filter: (page) => !page.includes('/admin'),
		}),
	],
	build: {
		inlineStylesheets: 'auto',
	},
});
