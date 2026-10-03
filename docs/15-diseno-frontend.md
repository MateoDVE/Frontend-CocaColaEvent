# Diseño e implementación frontend

## Dirección visual
Consulta de referencias: 2 de octubre de 2026. Se revisaron las colecciones actuales de [tipografía](https://www.awwwards.com/websites/typography/) y [visualización de datos](https://www.awwwards.com/websites/data-visualization/) de Awwwards. La segunda incluye Cerebrium (10 de septiembre de 2026) y Ai in Design Report 2026 (26 de agosto). Son referencias de composición y jerarquía, no una certificación UX ni diseños copiados.

Concepto: una cabina de operaciones con la energía de un festival Coca-Cola. Una franja roja de evento concentra la identidad; el resto permite leer y actuar. Se descartó una portada promocional con animaciones de scroll porque admin y staff necesitan operar inmediatamente.

Tokens: rojo marca #F40009, superficie roja #DF0009 y acción #CC0008 para asegurar contraste con texto blanco, tinta #202020, fondo #F6F7F9, blanco #FFFFFF, verde semántico #15734A. Barlow Condensed para títulos de evento; DM Sans para controles y datos. Fuentes locales, sin peticiones a Google Fonts. La marca utiliza los logos suministrados en public: cocacolaLogoBlanco.png (rojo sobre blanco), CocacolaLogoRojo.png (blanco sobre rojo) y Coca-Cola_LogoCircular.svg (favicon e icono PWA). Se conservan sus proporciones y colores originales.

Composición alineada a la izquierda:
```
Navegación | Contexto / selector de evento / modo demo
           | Evento destacado + acción de gestión
           | Indicadores comparables
           | Flujo de ingresos (2/3) | Voz del consumidor (1/3)
           | Sampling por producto  | Avisos operativos
```

Móvil: navegación plegable, bloques apilados, objetivos táctiles de 44 px; staff tiene una pantalla propia centrada en la validación. El color siempre se acompaña de texto/icono. Foco visible y respeto a reduced-motion.

## Alcance de esta entrega
Frontend autónomo con datos sintéticos y acciones locales en modo demo explícito. No constituye un backend, validación criptográfica, autenticación real, integración Meta/IA/SSE/Power BI ni garantía antifraude multi-dispositivo. La especificación productiva en docs/01–14 sigue vigente. No marcar historias end-to-end como terminadas por una demo frontend.

Se conservan React 18, Vite 6, TypeScript estricto, Router 6, Query, Zustand, Tailwind, primitivas Radix y contratos compartidos; rutas separadas y carga diferida para staff. La API productiva se integra posteriormente usando el envelope de docs/07. Check-in offline productivo necesita manifiesto autenticado y sincronización contra servidor; nunca se finge una aprobación offline de un QR desconocido.

## Validación local
- 14 pruebas unitarias: fechas/código, publicación, transiciones, scope del staff, check-in repetido, idempotencia, producto y límite de sampling (solo semántica demo, no concurrencia en servidor).
- 4 pruebas Playwright en Chrome: dashboard y responsive; crear/configurar/publicar evento; filtros/productos/CSV; staff check-in/sampling/duplicados/bloqueo offline/cierre de turno.
- axe-core: sin violaciones detectadas de WCAG A/AA en dashboard de escritorio y escáner móvil. No equivale a una auditoría de todas las pantallas ni a pruebas con lectores de pantalla.
- Capturas revisadas a 1440 px y 390 px en `docs/screenshots/`. No se probaron dispositivos físicos, permisos de cámara reales ni despliegue.

## Límites y siguiente integración
- La curva de 15 minutos está identificada como ilustrativa; las métricas son snapshots sintéticos, no se presentan como SSE conectado.
- Sesiones y escaneos en memoria; eventos/catálogo/configuración de prueba en localStorage. Ningún token real se almacena allí.
- Los nuevos accesos muestran PIN una vez como demostración de interfaz; no autentican. El único login de prueba es LOLLA26/123456.
- Las campañas se editan solo en borrador/publicado. El reporte detallado de cupones, edición de evento, búsqueda manual y simulador WhatsApp siguen pendientes.
- La configuración PWA genera shell precacheado. No implica manifiesto de asistentes, validación HMAC, cola Dexie ni sync productivo.
- El cliente HTTP es una base de integración, aún no conectado: faltan login/refresh/roles, DTOs completos del servidor y hooks productivos. No se cambia ninguna política BR pendiente.
