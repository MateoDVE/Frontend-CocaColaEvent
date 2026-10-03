# Frontend de demostración

## Ejecutar

```bash
pnpm install
npm run dev
```

Abrir [http://127.0.0.1:5173](http://127.0.0.1:5173) y elegir **Explorar demo de operaciones**. Para staff: código `LOLLA26`, PIN `123456`. Los códigos de prueba del escáner son `DEMO-VALENTINA` y `DEMO-DIEGO`; primero realizar check-in y luego probar el sampling.

La demo guarda eventos y catálogo en el navegador. Las sesiones y escaneos del turno permanecen en memoria y se reinician al recargar. Los PIN generados en la gestión de staff son ilustrativos; solo el acceso de prueba anterior inicia sesión. No introducir datos reales.

Incluye panel, listado/creación/ciclo de eventos, actividades, accesos de prueba, campaña de cupones, catálogo, explorador de opiniones, comparación y CSV; staff incluye selección de actividad, cámara, semáforo e historial. No incluye todavía backend, auth JWT, sincronización offline, SSE, bot WhatsApp, procesamiento IA ni conexión Power BI. La cámara requiere localhost o HTTPS; no se validó con una cámara física.

```bash
npm run typecheck
npm test
npm run build
# Con el servidor npm run dev activo; usa Chrome instalado:
npm run test:e2e
```

Si Chrome no está instalado, cambiar `channel` en `apps/web/playwright.config.ts` o instalar Chromium de Playwright. El build queda en `apps/web/dist`; el hosting debe redirigir rutas SPA a `index.html`.

Diseño y alcance: [docs/15-diseno-frontend.md](./docs/15-diseno-frontend.md). El modo demo no sustituye los controles de servidor definidos en la especificación.
