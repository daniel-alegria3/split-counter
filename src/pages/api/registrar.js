import { SHEETS_WEBHOOK_URL } from 'astro:env/server';
import { validarEvento, COLUMNAS } from '../../lib/eventos.js';

// Corre como función serverless en Vercel (no se prerenderiza).
export const prerender = false;

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});

export async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'JSON inválido' }, 400);
	}

	// Acepta un evento o un lote (sincronización offline).
	const entrada = Array.isArray(body) ? body : [body];
	if (entrada.length === 0) return json({ ok: true, guardados: 0 });
	if (entrada.length > 200) return json({ ok: false, error: 'lote demasiado grande' }, 400);

	let filas;
	try {
		filas = entrada.map(validarEvento);
	} catch (err) {
		return json({ ok: false, error: err.message }, 400);
	}

	const webhook = SHEETS_WEBHOOK_URL;
	if (!webhook) {
		return json({ ok: false, error: 'SHEETS_WEBHOOK_URL no configurada' }, 500);
	}

	try {
		const res = await fetch(webhook, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ columnas: COLUMNAS, filas }),
		});
		if (!res.ok) {
			const txt = await res.text().catch(() => '');
			return json({ ok: false, error: `hoja respondió ${res.status}: ${txt.slice(0, 200)}` }, 502);
		}
	} catch (err) {
		return json({ ok: false, error: `no se pudo contactar la hoja: ${err.message}` }, 502);
	}

	return json({ ok: true, guardados: filas.length });
}
