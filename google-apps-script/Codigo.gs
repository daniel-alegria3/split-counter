/**
 * Apps Script para recibir eventos del Contador (Comedor UNSAAC) y
 * guardarlos en la hoja "datos".
 *
 * Instalación:
 *  1. Abre tu Google Sheet → Extensiones → Apps Script.
 *  2. Pega este código (reemplaza lo que haya) y guarda.
 *  3. Implementar → Nueva implementación → tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *  4. Copia la URL (.../exec) y ponla en Vercel como SHEETS_WEBHOOK_URL.
 *
 * La app envía: { columnas: [...], filas: [ {col: val, ...}, ... ] }
 */

var HOJA = 'datos';
var ENCABEZADOS = ['timestamp', 'observador', 'tipo', 'estacion', 'valor', 'intervalo', 'notas'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita filas pisadas si dos observadores envían a la vez
  try {
    var datos = JSON.parse(e.postData.contents);
    var columnas = datos.columnas || ENCABEZADOS;
    var filas = datos.filas || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName(HOJA);
    if (!hoja) {
      hoja = ss.insertSheet(HOJA);
      hoja.appendRow(ENCABEZADOS);
    }
    if (hoja.getLastRow() === 0) hoja.appendRow(ENCABEZADOS);

    var matriz = filas.map(function (f) {
      return columnas.map(function (c) { return f[c] !== undefined ? f[c] : ''; });
    });

    if (matriz.length > 0) {
      hoja.getRange(hoja.getLastRow() + 1, 1, matriz.length, columnas.length).setValues(matriz);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, guardados: matriz.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Prueba rápida desde el editor (Ejecutar → doGet) para verificar acceso.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, mensaje: 'Contador UNSAAC activo' }))
    .setMimeType(ContentService.MimeType.JSON);
}
