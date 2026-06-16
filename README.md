# Contador — Comedor Universitario UNSAAC

App móvil para **tomar datos de campo** del estudio de simulación del comedor
(tiempos de servicio, llegadas, colas y decisiones de los comensales). Se
despliega en Vercel y cada medición se guarda en una **Google Sheet**.

## Herramientas en la app

- **⏱ Tiempos** — cronómetro por estación (huelleros, P1–P5, ají, bandeja,
  escalera, devolución). Cada toma se guarda sola; muestra promedio en vivo.
- **＋ Llegadas** — contador tipo *tally* ligado al intervalo de 20 min actual.
- **≡ Colas** — registra la longitud de cola observada en una estación.
- **% Decisión** — botones sí/no para % ají y % piso 2 vs piso 1.

Cada observador se identifica con su nombre y todos escriben a la misma hoja.
Los datos se encolan en el navegador y se sincronizan solos cuando hay red
(resistente a cortes de wifi en el comedor).

## Puesta en marcha

Ver **[CONFIGURACION.md](CONFIGURACION.md)** — crear la Google Sheet, publicar
el Apps Script, configurar `SHEETS_WEBHOOK_URL` y desplegar en Vercel.

## Comandos

| Comando           | Acción                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Instala dependencias                         |
| `npm run dev`     | Servidor local en `localhost:4321`           |
| `npm run build`   | Compila a `./dist/`                          |
| `npm run preview` | Previsualiza el build                        |

## Estructura

```text
/
├── google-apps-script/Codigo.gs   # doPost que escribe en la hoja
├── src/
│   ├── lib/
│   │   ├── eventos.js             # estaciones, tipos y validación (compartido)
│   │   └── cola-cliente.js        # cola offline + sincronización (navegador)
│   └── pages/
│       ├── index.astro           # UI (las 4 herramientas)
│       └── api/registrar.js      # endpoint serverless → Google Sheet
├── astro.config.mjs              # adaptador Vercel + esquema de env
└── CONFIGURACION.md              # guía de setup y análisis
```
