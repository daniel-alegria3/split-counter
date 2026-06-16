// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	adapter: vercel(),
	// Páginas estáticas en CDN; solo /api/* corre como función serverless
	// (cada endpoint marca `export const prerender = false`).
	env: {
		schema: {
			// URL del Apps Script Web App de la Google Sheet.
			// En local: archivo .env  ·  En Vercel: Environment Variables.
			SHEETS_WEBHOOK_URL: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
		},
	},
});
