// Definiciones compartidas entre el cliente (UI) y el servidor (API).
// Cada medición de campo se modela como un "evento" = una fila en la hoja.

/** Tipos de evento que registra la app. */
export const TIPOS = ['tiempo', 'llegada', 'cola', 'decision'];

/**
 * Estaciones del comedor (según especificaciones del modelo).
 * `id` viaja en los datos; `nombre` se muestra en la UI.
 */
export const ESTACIONES = [
	{ id: 'huellero_a', nombre: 'Huellero A', grupo: 'Piso 1' },
	{ id: 'huellero_b', nombre: 'Huellero B', grupo: 'Piso 1' },
	{ id: 'bandeja', nombre: 'Bandeja (fruta + pan)', grupo: 'Piso 1' },
	{ id: 'escalera', nombre: 'Subir al 2do piso', grupo: 'Tránsito' },
	{ id: 'P1', nombre: 'P1 · Postre', grupo: 'Línea de servido' },
	{ id: 'P2', nombre: 'P2 · Sopa', grupo: 'Línea de servido' },
	{ id: 'P3', nombre: 'P3 · Segundo', grupo: 'Línea de servido' },
	{ id: 'P4', nombre: 'P4 · Arroz', grupo: 'Línea de servido' },
	{ id: 'P5', nombre: 'P5 · Mate', grupo: 'Línea de servido' },
	{ id: 'aji', nombre: 'Ají (autoservicio)', grupo: 'Piso 2' },
	{ id: 'devolucion', nombre: 'Devolución de bandeja', grupo: 'Salida' },
];

export const ESTACION_IDS = ESTACIONES.map((e) => e.id);

/** Categorías válidas para eventos de decisión. */
export const DECISIONES = ['aji_si', 'aji_no', 'piso_2', 'piso_1'];

/** Intervalos de llegada de 20 min entre 11:00 y 15:00. */
export const INTERVALOS = (() => {
	const out = [];
	for (let m = 11 * 60; m < 15 * 60; m += 20) {
		const fmt = (t) =>
			`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
		out.push(`${fmt(m)}-${fmt(m + 20)}`);
	}
	return out;
})();

/** Devuelve el intervalo de 20 min que contiene la hora dada (o null fuera de rango). */
export function intervaloDe(fecha = new Date()) {
	const min = fecha.getHours() * 60 + fecha.getMinutes();
	if (min < 11 * 60 || min >= 15 * 60) return null;
	const idx = Math.floor((min - 11 * 60) / 20);
	return INTERVALOS[idx];
}

/**
 * Valida y normaliza un evento entrante. Lanza Error con mensaje si es inválido.
 * Devuelve el objeto fila listo para la hoja.
 */
export function validarEvento(ev) {
	if (!ev || typeof ev !== 'object') throw new Error('evento ausente');

	const observador = String(ev.observador ?? '').trim();
	if (!observador) throw new Error('falta observador');

	const tipo = String(ev.tipo ?? '');
	if (!TIPOS.includes(tipo)) throw new Error(`tipo inválido: ${tipo}`);

	const fila = {
		timestamp: ev.timestamp ? String(ev.timestamp) : new Date().toISOString(),
		observador,
		tipo,
		estacion: '',
		valor: '',
		intervalo: ev.intervalo ? String(ev.intervalo) : '',
		notas: ev.notas ? String(ev.notas).slice(0, 500) : '',
	};

	if (tipo === 'tiempo' || tipo === 'cola') {
		if (!ESTACION_IDS.includes(ev.estacion)) {
			throw new Error(`estación inválida: ${ev.estacion}`);
		}
		const valor = Number(ev.valor);
		if (!Number.isFinite(valor) || valor < 0) throw new Error('valor numérico inválido');
		fila.estacion = ev.estacion;
		fila.valor = valor;
	} else if (tipo === 'llegada') {
		const valor = Number(ev.valor ?? 1);
		if (!Number.isFinite(valor) || valor < 0) throw new Error('valor de llegada inválido');
		// La entrada principal usa 'entrada'; también se cuentan llegadas a
		// estaciones internas (línea, devolución), que sí llevan su id.
		const est = ev.estacion ? String(ev.estacion) : 'entrada';
		if (est !== 'entrada' && !ESTACION_IDS.includes(est)) {
			throw new Error(`estación inválida: ${est}`);
		}
		fila.estacion = est;
		fila.valor = valor;
		if (!fila.intervalo) throw new Error('falta intervalo en llegada');
	} else if (tipo === 'decision') {
		if (!DECISIONES.includes(ev.valor)) throw new Error(`decisión inválida: ${ev.valor}`);
		fila.estacion = ev.valor.startsWith('aji') ? 'aji' : 'piso';
		fila.valor = ev.valor;
	}

	return fila;
}

/** Orden de columnas de la hoja (debe coincidir con los encabezados). */
export const COLUMNAS = ['timestamp', 'observador', 'tipo', 'estacion', 'valor', 'intervalo', 'notas'];
