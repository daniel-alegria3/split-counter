// Cola de eventos en el navegador con sincronización resistente a cortes de red.
// Cada evento se guarda primero en localStorage; un loop intenta enviarlos en
// lotes a /api/registrar. Nada se pierde si el wifi del comedor falla.

const CLAVE = 'split-counter:pendientes';
const CLAVE_OBS = 'split-counter:observador';

const oyentes = new Set();

function leer() {
	try {
		return JSON.parse(localStorage.getItem(CLAVE) || '[]');
	} catch {
		return [];
	}
}

function escribir(arr) {
	localStorage.setItem(CLAVE, JSON.stringify(arr));
	notificar();
}

function notificar() {
	const n = leer().length;
	oyentes.forEach((fn) => fn(n));
}

/** Suscribe un callback que recibe la cantidad de pendientes. Devuelve un unsubscribe. */
export function alCambiar(fn) {
	oyentes.add(fn);
	fn(leer().length);
	return () => oyentes.delete(fn);
}

export function getObservador() {
	return localStorage.getItem(CLAVE_OBS) || '';
}

export function setObservador(nombre) {
	localStorage.setItem(CLAVE_OBS, nombre);
}

export function pendientes() {
	return leer().length;
}

/** Encola un evento (le añade observador y timestamp) y programa el envío. */
export function encolar(ev) {
	const completo = {
		...ev,
		observador: ev.observador || getObservador(),
		timestamp: ev.timestamp || new Date().toISOString(),
	};
	const arr = leer();
	arr.push(completo);
	escribir(arr);
	programarSync(); // espera unos segundos antes de enviar (ventana para deshacer)
	return completo;
}

/**
 * Quita el último evento pendiente (aún no enviado) para deshacer una toma
 * por error. `match` opcional valida que el último sea el esperado; si ya se
 * envió o no coincide, devuelve null y no quita nada.
 */
export function quitarUltimo(match) {
	const arr = leer();
	if (arr.length === 0) return null;
	const ult = arr[arr.length - 1];
	if (match && !match(ult)) return null;
	arr.pop();
	escribir(arr);
	return ult;
}

let sincronizando = false;
let timerSync = 0;

/** Agenda una sincronización con retraso (debounce): da margen para deshacer. */
export function programarSync(ms = 4000) {
	clearTimeout(timerSync);
	timerSync = setTimeout(sincronizar, ms);
}

/** Intenta enviar todos los pendientes en un solo lote. Reintenta si falla. */
export async function sincronizar() {
	if (sincronizando) return;
	if (!navigator.onLine) return;
	const arr = leer();
	if (arr.length === 0) return;

	sincronizando = true;
	try {
		const lote = arr.slice(0, 200);
		const res = await fetch('/api/registrar', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(lote),
		});
		if (res.ok) {
			// Quita los enviados (preservando lo encolado mientras tanto).
			const actual = leer();
			escribir(actual.slice(lote.length));
		}
	} catch {
		// Sin red o servidor caído: se reintenta luego.
	} finally {
		sincronizando = false;
	}
}

/** Arranca el loop de sincronización (al cargar, al recuperar red y cada 15 s). */
export function iniciarSync() {
	window.addEventListener('online', sincronizar);
	setInterval(sincronizar, 15000);
	sincronizar();
}
