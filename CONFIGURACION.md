# Configuración — Contador Comedor UNSAAC

App para tomar datos de campo del estudio de simulación y guardarlos en Google
Sheets. Frontend en Astro, desplegado en Vercel; cada medición se envía a una
hoja vía un Apps Script Web App.

## Arquitectura

```
Celular (UI Astro) ──► /api/registrar (Vercel, serverless) ──► Apps Script ──► Google Sheet
        │
        └── cola en localStorage: si no hay red, reintenta solo
```

Cada medición es una fila: `timestamp · observador · tipo · estacion · valor · intervalo · notas`.

| tipo       | qué guarda            | estacion              | valor                          |
|------------|-----------------------|-----------------------|--------------------------------|
| `tiempo`   | tiempo de servicio    | huellero, P1…P5, consumo, etc. | segundos (decimal)             |
| `llegada`  | un estudiante que llega | `entrada`           | 1 (o 0 si se deshace)          |
| `cola`     | longitud de cola      | devolucion, etc.      | nº de personas                 |
| `decision` | elección del comensal | aji / piso            | aji_si, aji_no, piso_2, piso_1 |

---

## 1. Crear la Google Sheet

1. Crea una hoja nueva en Google Sheets. Nómbrala como quieras (ej. *Datos Comedor*).
2. Renombra la primera pestaña a **`datos`**.
3. En la fila 1 pon los encabezados (el script también los crea solo si faltan):

   `timestamp` · `observador` · `tipo` · `estacion` · `valor` · `intervalo` · `notas`

## 2. Publicar el Apps Script

1. En la hoja: **Extensiones → Apps Script**.
2. Borra lo que haya y pega el contenido de [`google-apps-script/Codigo.gs`](google-apps-script/Codigo.gs). Guarda.
3. **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
4. Autoriza los permisos cuando lo pida.
5. Copia la **URL del web app** (termina en `/exec`).

## 3. Variable de entorno

### En Vercel (producción)
Project → **Settings → Environment Variables**:

```
SHEETS_WEBHOOK_URL = https://script.google.com/macros/s/XXXXX/exec
```

Aplícala a Production (y Preview si quieres). Redeploy para que tome efecto.

### En local (para probar el guardado real)
Crea un archivo `.env` en la raíz (ya está en `.gitignore`):

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXXX/exec
```

## 4. Desplegar en Vercel

```bash
npm i -g vercel   # si no lo tienes
vercel            # primera vez: enlaza el proyecto
vercel --prod     # despliega a producción
```

O conecta el repo de GitHub en vercel.com y cada push despliega solo.

---

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
```

Sin `SHEETS_WEBHOOK_URL`, la UI funciona y encola, pero `/api/registrar`
responde 500 al sincronizar (los datos quedan guardados en el navegador hasta
que configures la URL).

## Probar el endpoint a mano

```bash
curl -X POST http://localhost:4321/api/registrar \
  -H 'content-type: application/json' \
  -d '{"observador":"prueba","tipo":"tiempo","estacion":"huellero","valor":4.2}'
```

## Analizar los datos

Todo cae en la hoja `datos`. Para la simulación:
- **Tiempos de servicio**: filtra `tipo=tiempo`, agrupa por `estacion` → media,
  desviación, distribución por estación.
- **Tasa de llegadas**: filtra `tipo=llegada`, tabla dinámica por `intervalo`
  (suma de `valor`).
- **Colas**: `tipo=cola` por estación (validar la devolución ≈ 5).
- **Probabilidades**: `tipo=decision`, cuenta `aji_si/aji_no` y `piso_2/piso_1`.
