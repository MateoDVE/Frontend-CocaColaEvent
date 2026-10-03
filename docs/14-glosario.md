# 14 · Glosario

| Término | Definición |
|---------|------------|
| **Activación / Evento** | Instancia física de marca (festival, lanzamiento, pop-up) gestionada en el sistema. Entidad `Event`. |
| **Actividad** | Punto de interacción dentro de un evento: stand de sampling, photocall, juego, zona VIP. Entidad `Activity`. |
| **Agregado** | Grupo de entidades que se modifica como unidad y protege sus invariantes (DDD). Ej.: `Registration` con sus `Interaction`. |
| **Aforo (`capacity`)** | Máximo de inscripciones vigentes aceptadas para un evento. |
| **Asistente** | Participante cuya inscripción está en estado `ATTENDED` (hizo check-in). |
| **Audio-to-Insights** | Pipeline que convierte una nota de voz en datos estructurados (transcripción + análisis LLM). |
| **Check-in** | Validación del QR en el acceso al evento. Cambia la inscripción a `ATTENDED`. |
| **`claimNumber`** | Número correlativo de canje de un participante en una actividad (1..`maxClaimsPerUser`). Base del antifraude. |
| **`clientScanId`** | UUID generado por la PWA por cada escaneo; permite reintentos idempotentes. |
| **Código público (`publicCode`)** | Código corto del evento (ej. `LOLLA26`) usado en el mensaje inicial de WhatsApp. |
| **Cupón** | Código de incentivo enviado tras el feedback, según la política de la campaña. |
| **Detractor** | Feedback con `sentimentScore ≤ 2`. |
| **Envelope** | Estructura estándar de respuesta de la API (`success`, `code`, `message`, `data`). |
| **Inscripción (`Registration`)** | Relación participante–evento; contiene el QR. |
| **Interacción (`Interaction`)** | Registro de un canje o participación en una actividad. |
| **Manifiesto offline** | Lista de hashes de QR y nombres de pila descargada a la PWA para validar ingresos sin red. |
| **Meta Cloud API** | API oficial de WhatsApp Business alojada por Meta. |
| **Net Sentiment Score** | % de feedback con puntaje ≥ 4 menos % con ≤ 2. No es NPS. |
| **Participante** | Consumidor que interactúa por WhatsApp. Identificado por su teléfono. Entidad `Participant`. |
| **Phygital** | Experiencia que combina lo físico (evento) con lo digital (WhatsApp, QR). |
| **Plantilla (template)** | Mensaje de WhatsApp preaprobado por Meta; obligatorio para escribir a alguien fuera de la ventana de 24 h. |
| **Puerto / Adaptador** | Interfaz que define una dependencia externa (puerto) y su implementación concreta (adaptador). |
| **PWA** | Progressive Web App: web instalable con capacidades offline. Usada por el staff. |
| **Recurrente** | Participante que asistió (check-in) a al menos otro evento anterior. |
| **Sampling** | Entrega de muestras de producto para degustación. |
| **Sampling abuse** | Fraude por el que una persona obtiene más muestras de las permitidas. |
| **Semáforo** | Feedback visual de la PWA: 🟢 éxito, 🟡 aviso, 🔴 rechazo, ⚪ sin conexión. |
| **SSE** | Server-Sent Events: canal HTTP unidireccional servidor→cliente para el dashboard en vivo. |
| **Staff / Promotor** | Persona en terreno que escanea QR con la PWA. Accede con código de evento + PIN (`StaffAccess`). |
| **Structured Outputs** | Modo del LLM que obliga a responder con un JSON que cumple un schema. |
| **Token QR** | Cadena firmada (`cei1.<registrationId>.<firma>`) codificada en el QR. |
| **Ventana de 24 h** | Regla de WhatsApp: mensajes libres solo dentro de 24 h desde el último mensaje del usuario. |
