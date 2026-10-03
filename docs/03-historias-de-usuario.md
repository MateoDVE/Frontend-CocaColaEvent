# 03 · Historias de Usuario

Formato: **Como** <rol> **quiero** <acción> **para** <beneficio>. Cada historia indica prioridad (MoSCoW), estimación en puntos de historia (SP, Fibonacci), reglas de negocio aplicables y criterios de aceptación en Gherkin. Los criterios de aceptación son la base de los tests e2e.

**Roles:** 🧑‍💼 Admin · 🧑‍🔧 Staff · 🙋 Participante · ⚙️ Sistema

---

## Mapa de épicas

| Épica | Nombre | Historias | Fase |
|-------|--------|-----------|------|
| EP-01 | Gestión de eventos y catálogo | US-01 … US-06 | 1 |
| EP-02 | Accesos y autenticación | US-07 … US-10 | 1 |
| EP-03 | Onboarding por WhatsApp | US-11 … US-16 | 3 |
| EP-04 | Check-in | US-17 … US-20 | 2 |
| EP-05 | Sampling antifraude | US-21 … US-23 | 2 |
| EP-06 | Feedback por voz con IA | US-24 … US-29 | 3 |
| EP-07 | Cupones | US-30 … US-31 | 3 |
| EP-08 | Dashboard en vivo y analítica | US-32 … US-36 | 4 |
| EP-09 | Privacidad y derechos del titular | US-37 … US-39 | 3–4 |
| EP-10 | Plataforma y operación | US-40 … US-42 | transversal |

---

## EP-01 · Gestión de eventos y catálogo

### US-01 — Crear evento · 🧑‍💼 · Must · 3 SP
**Como** admin **quiero** crear un evento con nombre, tipo, fechas, lugar, aforo, meta de asistencia y código público **para** preparar su operación.
*Reglas:* BR-EVT-01, BR-EVT-02, BR-EVT-06.
```gherkin
Escenario: creación válida
  Dado que estoy autenticado como admin
  Cuando creo el evento "Lollapalooza Coca-Cola Stage" con código "LOLLA26", aforo 5000 y meta 4000
  Entonces el evento queda en estado DRAFT
  Y aparece en el listado de eventos

Escenario: fechas inválidas
  Cuando creo un evento cuyo fin es anterior al inicio
  Entonces recibo el error VALIDATION_ERROR indicando el campo "endsAt"

Escenario: código duplicado
  Dado que existe un evento con código "LOLLA26"
  Cuando creo otro evento con código "LOLLA26"
  Entonces recibo el error EVENT_CODE_TAKEN
```

### US-02 — Editar y listar eventos · 🧑‍💼 · Must · 3 SP
**Como** admin **quiero** listar (filtrando por estado y fecha) y editar eventos **para** mantener la información al día.
```gherkin
Escenario: edición restringida en evento activo
  Dado un evento ACTIVE
  Cuando intento cambiar sus fechas
  Entonces recibo EVENT_NOT_EDITABLE
  Pero sí puedo agregar una actividad
```

### US-03 — Ciclo de vida del evento · 🧑‍💼⚙️ · Must · 5 SP
**Como** admin **quiero** publicar, iniciar, cerrar o cancelar un evento (y que el sistema lo haga automáticamente según fechas) **para** controlar cuándo se puede inscribir y escanear.
*Reglas:* BR-EVT-03, BR-EVT-04, BR-EVT-05.
```gherkin
Escenario: publicar sin actividades
  Dado un evento DRAFT sin actividades
  Cuando lo publico
  Entonces recibo EVENT_NOT_PUBLISHABLE

Escenario: inicio automático
  Dado un evento PUBLISHED cuyo startsAt ya pasó
  Cuando corre el job de ciclo de vida
  Entonces el evento pasa a ACTIVE

Escenario: cancelación notifica a inscritos
  Dado un evento PUBLISHED con 10 inscripciones REGISTERED
  Cuando lo cancelo
  Entonces las 10 inscripciones quedan CANCELLED
  Y se encolan 10 mensajes de plantilla "event_cancelled"
```

### US-04 — Configurar actividades · 🧑‍💼 · Must · 3 SP
**Como** admin **quiero** definir actividades del evento (nombre, categoría, máximo de canjes por persona, productos ofrecidos) **para** controlar el sampling.
```gherkin
Escenario: actividad de sampling
  Cuando creo la actividad "Stand Zero" categoría SAMPLING con máximo 1 canje y productos ["Coca-Cola Zero 350ml"]
  Entonces la actividad queda activa y asociada al evento

Escenario: desactivar actividad con canjes
  Dado una actividad con interacciones registradas
  Cuando la elimino
  Entonces se desactiva (isActive=false) en lugar de borrarse
```

### US-05 — Catálogo de productos · 🧑‍💼 · Must · 2 SP
**Como** admin **quiero** mantener un catálogo de productos (SKU, nombre, línea de marca) **para** que los reportes por producto sean consistentes.
```gherkin
Escenario: SKU único
  Dado un producto con SKU "CCZ-350"
  Cuando creo otro con SKU "CCZ-350"
  Entonces recibo PRODUCT_SKU_TAKEN
```

### US-06 — Configurar campaña de cupones y políticas · 🧑‍💼 · Should · 3 SP
**Como** admin **quiero** configurar la campaña de cupón (prefijo, descuento, vigencia, política) y las políticas del evento (feedback, overbooking) **para** adaptar cada activación.
*Reglas:* BR-CPN-01, BR-CPN-02, sección 4 de [02](./02-logica-de-negocio.md#4-políticas-configurables-por-evento).

---

## EP-02 · Accesos y autenticación

### US-07 — Login de admin · 🧑‍💼 · Must · 3 SP
**Como** admin **quiero** iniciar sesión con email y contraseña **para** acceder al dashboard.
```gherkin
Escenario: credenciales correctas
  Cuando ingreso email y contraseña válidos
  Entonces recibo un access token (15 min) y un refresh token (cookie httpOnly, 7 días)

Escenario: credenciales incorrectas
  Entonces recibo INVALID_CREDENTIALS sin indicar cuál campo falló
```

### US-08 — Generar accesos de staff · 🧑‍💼 · Must · 3 SP
**Como** admin **quiero** generar accesos por evento con PIN y actividades permitidas **para** que los promotores operen sin cuentas personales.
*Reglas:* BR-STF-01, BR-STF-04.
```gherkin
Escenario: PIN visible una sola vez
  Cuando creo el acceso "Stand Zero 1" con la actividad "Stand Zero"
  Entonces veo el PIN de 6 dígitos una única vez
  Y en el listado posterior el PIN no se muestra

Escenario: revocación
  Dado un staff logueado con el acceso "Stand Zero 1"
  Cuando revoco ese acceso
  Entonces su siguiente escaneo devuelve STAFF_ACCESS_REVOKED
```

### US-09 — Login de staff con código de evento y PIN · 🧑‍🔧 · Must · 3 SP
**Como** promotor **quiero** entrar con el código del evento y un PIN **para** empezar a escanear en segundos.
*Reglas:* BR-STF-02, BR-STF-03.
```gherkin
Escenario: bloqueo por intentos
  Cuando ingreso 5 PIN incorrectos para "LOLLA26"
  Entonces recibo TOO_MANY_ATTEMPTS y debo esperar 15 minutos
```

### US-10 — Seleccionar modo de escaneo · 🧑‍🔧 · Must · 2 SP
**Como** promotor **quiero** elegir el modo (Check-in o una de mis actividades) y, si aplica, el producto que entrego **para** no seleccionarlo en cada escaneo.
```gherkin
Escenario: solo actividades permitidas
  Dado que mi acceso permite solo "Stand Zero"
  Entonces el selector muestra "Stand Zero" y no muestra "Photocall"
```

---

## EP-03 · Onboarding por WhatsApp

### US-11 — Iniciar conversación desde un QR físico · 🙋 · Must · 3 SP
**Como** participante **quiero** escanear un afiche y que se abra WhatsApp con un mensaje listo **para** inscribirme sin descargar nada.
*Reglas:* BR-EVT-02, BR-REG-08.
```gherkin
Escenario: código de evento reconocido
  Dado el evento "LOLLA26" PUBLISHED
  Cuando envío "Hola CocaCola #LOLLA26"
  Entonces el bot responde WELCOME con el nombre del evento y pregunta mi nombre

Escenario: sin código o código desconocido
  Cuando envío "Hola"
  Entonces el bot lista los eventos abiertos como botones de selección
```

### US-12 — Completar registro conversacional · 🙋 · Must · 5 SP
**Como** participante **quiero** responder nombre, rango de edad (botones) y ciudad **para** quedar inscrito rápido.
*Reglas:* BR-REG-02, BR-REG-04.
```gherkin
Escenario: menor de edad
  Cuando selecciono el rango "Menor de 18"
  Entonces el bot responde MINOR_REJECTED
  Y no se guarda ningún dato personal

Escenario: respuesta inválida
  Cuando respondo el nombre con un solo carácter
  Entonces el bot vuelve a pedirlo con un ejemplo
```

### US-13 — Dar consentimiento · 🙋 · Must · 3 SP
**Como** participante **quiero** aceptar la política de datos y, por separado, decidir si recibo marketing **para** controlar el uso de mis datos.
*Reglas:* BR-REG-03, BR-PRV-03.
```gherkin
Escenario: no acepta tratamiento de datos
  Cuando presiono "No acepto"
  Entonces el bot se despide amablemente
  Y la sesión conversacional se borra sin persistir datos

Escenario: acepta datos, rechaza marketing
  Cuando presiono "Acepto" y luego "No" a promociones
  Entonces se crea el participante con marketingConsent=false y consentAt registrado
```

### US-14 — Recibir pase QR · 🙋 · Must · 3 SP
**Como** participante **quiero** recibir mi QR como imagen en el chat **para** mostrarlo en el acceso.
*Reglas:* BR-REG-05, BR-REG-09.
```gherkin
Escenario: inscripción exitosa
  Cuando completo el consentimiento
  Entonces se crea la inscripción REGISTERED con un token firmado
  Y recibo REGISTERED con la imagen del QR

Escenario: ya inscrito
  Dado que ya estoy inscrito en "LOLLA26"
  Cuando escribo "#LOLLA26" o "MI QR"
  Entonces recibo nuevamente el mismo QR sin crear otra inscripción
```

### US-15 — Participante recurrente · 🙋 · Should · 2 SP
**Como** participante que ya asistió a otro evento **quiero** no repetir mis datos **para** inscribirme en un toque.
*Reglas:* BR-REG-06, BR-REG-07.
```gherkin
Escenario: datos precargados
  Dado que existo como participante
  Cuando escribo "#FANFEST26"
  Entonces el bot pregunta "¿Sigues siendo Valentina de Ñuñoa?" con botones Sí / Actualizar
```

### US-16 — Cancelar inscripción · 🙋 · Should · 2 SP
**Como** participante **quiero** escribir CANCELAR **para** liberar mi cupo si no podré ir.
*Reglas:* BR-REG-10.

---

## EP-04 · Check-in

### US-17 — Escanear QR en el acceso · 🧑‍🔧 · Must · 5 SP
**Como** promotor del acceso **quiero** escanear el QR y ver un semáforo inmediato **para** dejar pasar a la gente en menos de 1 segundo.
*Reglas:* BR-CHK-01..06.
```gherkin
Escenario: ingreso válido
  Dado un QR válido de una inscripción REGISTERED del evento activo
  Cuando lo escaneo en modo Check-in
  Entonces veo pantalla VERDE con "Bienvenido/a Valentina" y un sonido de éxito
  Y la inscripción queda ATTENDED con hora de ingreso

Escenario: doble ingreso
  Dado un QR ya usado a las 19:22
  Cuando lo escaneo
  Entonces veo pantalla AMARILLA "Ya ingresó a las 19:22"

Escenario: QR falso o de otro evento
  Cuando escaneo un QR con firma inválida
  Entonces veo pantalla ROJA "Código no reconocido" y vibración larga
```

### US-18 — Reintentos seguros · 🧑‍🔧 · Must · 2 SP
**Como** promotor **quiero** que un reintento por mala señal no duplique registros **para** confiar en el semáforo.
*Reglas:* BR-CHK-07.

### US-19 — Check-in sin conexión · 🧑‍🔧 · Should · 8 SP
**Como** promotor en un recinto sin señal **quiero** seguir validando ingresos **para** no detener la fila.
*Reglas:* BR-CHK-08, ADR-006.
```gherkin
Escenario: descarga de manifiesto
  Cuando inicio sesión con conexión
  Entonces la PWA descarga el manifiesto del evento (hashes de tokens + nombre de pila + estado)

Escenario: escaneo offline
  Dado que no hay conexión
  Cuando escaneo un QR presente en el manifiesto y no usado localmente
  Entonces veo VERDE con el indicador "offline"
  Y el escaneo queda en la cola local

Escenario: sincronización con conflicto
  Dado que otro dispositivo registró el mismo ingreso antes
  Cuando se sincroniza mi cola
  Entonces el servidor conserva el ingreso más temprano y me informa 1 conflicto
```

### US-20 — Búsqueda manual de inscrito · 🧑‍🔧 · Could · 3 SP
**Como** promotor **quiero** buscar por últimos 4 dígitos del teléfono **para** atender a quien tiene el celular sin batería o el QR ilegible.
```gherkin
Escenario: búsqueda
  Cuando busco "5678"
  Entonces veo coincidencias con nombre de pila y últimos 4 dígitos (nunca el teléfono completo)
  Y puedo hacer check-in manual (queda marcado como manual en auditoría)
```

---

## EP-05 · Sampling antifraude

### US-21 — Registrar entrega de muestra · 🧑‍🔧 · Must · 5 SP
**Como** promotor de stand **quiero** escanear el QR antes de entregar la muestra **para** asegurar que cada persona reciba solo lo que le corresponde.
*Reglas:* BR-SAM-01..07.
```gherkin
Escenario: primera muestra
  Dado un participante ATTENDED
  Y la actividad "Stand Zero" con máximo 1 canje
  Cuando escaneo su QR con producto "Coca-Cola Zero 350ml"
  Entonces veo VERDE "Entrega aprobada: Coca-Cola Zero 350ml (1 de 1)"

Escenario: intento de segunda muestra
  Cuando vuelvo a escanear el mismo QR en "Stand Zero"
  Entonces veo ROJO "Beneficio ya canjeado a las 20:45"

Escenario: no hizo check-in
  Dado un participante REGISTERED
  Cuando escaneo su QR en el stand
  Entonces veo AMARILLO "Debe pasar primero por el acceso"
```

### US-22 — Concurrencia en dos filas · ⚙️ · Must · 3 SP
**Como** marca **quiero** que dos escaneos simultáneos del mismo QR en una actividad de 1 canje produzcan una sola entrega **para** eliminar el abuso.
*Reglas:* BR-SAM-06.
```gherkin
Escenario: carrera
  Cuando llegan 2 solicitudes simultáneas del mismo QR a la misma actividad (max 1)
  Entonces exactamente 1 responde SAMPLING_CLAIMED
  Y la otra responde BENEFIT_ALREADY_REDEEMED
```

### US-23 — Historial del turno · 🧑‍🔧 · Could · 2 SP
**Como** promotor **quiero** ver mis últimos 20 escaneos y un contador del turno **para** cuadrar el stock entregado.

---

## EP-06 · Feedback por voz con IA

### US-24 — Recibir solicitud de feedback · 🙋⚙️ · Must · 3 SP
**Como** participante que asistió **quiero** recibir un mensaje después de mi experiencia **para** dar mi opinión cuando la tengo fresca.
*Reglas:* BR-FBK-01, 02, 03.
```gherkin
Escenario: disparo por inactividad
  Dado un participante ATTENDED cuya última actividad fue hace 31 minutos
  Cuando corre el job de feedback
  Entonces recibe FEEDBACK_REQUEST
  Y su feedback queda en REQUESTED

Escenario: horario silencioso
  Dado que son las 23:10 hora del evento
  Entonces la solicitud se pospone hasta las 09:00
```

### US-25 — Enviar nota de voz · 🙋 · Must · 5 SP
**Como** participante **quiero** mandar un audio hablando con naturalidad **para** opinar sin llenar encuestas.
*Reglas:* BR-FBK-04, 05, 06.
```gherkin
Escenario: audio válido
  Cuando envío un audio de 20 segundos
  Entonces el bot responde "¡Recibido! 🎧" en menos de 3 segundos
  Y el feedback pasa a RECEIVED y se encola el procesamiento

Escenario: audio demasiado corto
  Cuando envío un audio de 1 segundo
  Entonces el bot me pide uno un poco más largo

Escenario: feedback por texto
  Cuando respondo con texto
  Entonces se acepta y se analiza sin transcripción
```

### US-26 — Transcribir y analizar con IA · ⚙️ · Must · 8 SP
**Como** marca **quiero** que cada audio se convierta en datos estructurados (sentimiento, gusto, intención de compra, temas, cita) **para** analizarlos a escala.
*Reglas:* BR-FBK-07, 08, 09.
```gherkin
Escenario: pipeline completo
  Dado un feedback RECEIVED con audio
  Cuando el worker lo procesa
  Entonces se guarda la transcripción
  Y se guarda el análisis validado contra el JSON Schema
  Y el feedback queda COMPLETED
  Y se emite feedback.completed

Escenario: audio irrelevante
  Cuando la IA marca isRelevant=false
  Entonces el feedback queda REJECTED y no se emite cupón

Escenario: falla del proveedor
  Cuando OpenAI responde error 3 veces
  Entonces el feedback queda FAILED y aparece en la bandeja de errores del admin
```

### US-27 — Reprocesar feedback fallido · 🧑‍💼 · Should · 2 SP
**Como** admin **quiero** reprocesar feedback FAILED **para** no perder opiniones por fallas temporales.

### US-28 — Explorar feedback · 🧑‍💼 · Must · 5 SP
**Como** admin **quiero** ver la lista de feedback de un evento con filtros (sentimiento, producto, intención de compra, tema) y escuchar el audio / leer la transcripción **para** entender a la audiencia.
```gherkin
Escenario: privacidad en listado
  Entonces el listado muestra nombre de pila, rango de edad y ciudad
  Y nunca muestra el número de teléfono completo
```

### US-29 — Alerta de detractores · 🧑‍💼 · Could · 2 SP
**Como** admin **quiero** ver alertas cuando llega feedback con sentimiento ≤ 2 **para** reaccionar durante el evento.
*Reglas:* BR-FBK-10.

---

## EP-07 · Cupones

### US-30 — Recibir cupón · 🙋 · Must · 3 SP
**Como** participante **quiero** recibir un cupón tras dar mi opinión **para** sentir que valió la pena.
*Reglas:* BR-CPN-01..06.
```gherkin
Escenario: política MIN_SENTIMENT
  Dado una campaña con política MIN_SENTIMENT y mínimo 3
  Cuando mi feedback queda COMPLETED con sentimiento 4
  Entonces recibo FEEDBACK_THANKS_COUPON con un código único

Escenario: bajo el umbral
  Cuando mi feedback queda COMPLETED con sentimiento 2
  Entonces recibo FEEDBACK_THANKS sin cupón

Escenario: un cupón por inscripción
  Dado que ya recibí cupón
  Entonces no se emite un segundo cupón bajo ninguna circunstancia
```

### US-31 — Reporte de cupones · 🧑‍💼 · Should · 2 SP
**Como** admin **quiero** ver cupones emitidos/vencidos por evento y exportarlos a CSV **para** coordinar con retail.

---

## EP-08 · Dashboard en vivo y analítica

### US-32 — Panel en vivo del evento · 🧑‍💼 · Must · 8 SP
**Como** admin **quiero** ver en tiempo real inscritos, asistentes, % de meta, muestras entregadas por producto, intentos de fraude bloqueados y sentimiento promedio **para** tomar decisiones durante el evento.
```gherkin
Escenario: actualización en vivo
  Dado que tengo abierto el panel de "LOLLA26"
  Cuando un staff realiza un check-in
  Entonces el contador de asistentes se actualiza en menos de 5 segundos sin recargar
```

### US-33 — Curvas por hora · 🧑‍💼 · Should · 3 SP
**Como** admin **quiero** ver ingresos y canjes por intervalos de 15 min **para** dimensionar staff y stock.

### US-34 — Comparativo entre eventos · 🧑‍💼 · Should · 5 SP
**Como** admin **quiero** comparar KPIs entre eventos **para** evaluar el ROI de cada formato.

### US-35 — Vistas para Power BI · 🧑‍💼 · Must · 3 SP
**Como** analista BI **quiero** conectarme por DirectQuery a vistas SQL sin datos personales **para** construir reportes ejecutivos.
*Reglas:* BR-PRV-04. Ver [10](./10-analitica-power-bi.md).

### US-36 — Exportar datos · 🧑‍💼 · Could · 2 SP
**Como** admin **quiero** exportar métricas e insights a CSV **para** compartirlos con agencias.

---

## EP-09 · Privacidad y derechos del titular

### US-37 — Borrar mis datos · 🙋 · Must · 3 SP
**Como** participante **quiero** escribir BORRAR MIS DATOS **para** ejercer mi derecho de supresión.
*Reglas:* BR-REG-11, BR-PRV-02.
```gherkin
Escenario: confirmación
  Cuando escribo "BORRAR MIS DATOS"
  Entonces el bot pide confirmación con botones
  Y al confirmar mis datos se anonimizan y recibo confirmación
```

### US-38 — Purga automática de audios · ⚙️ · Must · 2 SP
**Como** responsable de datos **quiero** que los audios se borren a los 30 días del evento **para** minimizar datos sensibles.
*Reglas:* BR-PRV-01.

### US-39 — Auditoría de acciones · 🧑‍💼 · Should · 3 SP
**Como** admin **quiero** un registro de quién hizo qué (escaneos manuales, revocaciones, anonimizaciones, reprocesos) **para** responder ante incidentes.

---

## EP-10 · Plataforma y operación

### US-40 — Health checks y observabilidad · ⚙️ · Must · 3 SP
Endpoint `/health` (DB, Redis), logs estructurados JSON con `requestId`, métricas de latencia de escaneo.

### US-41 — Seed de datos de demo · ⚙️ · Must · 2 SP
Seed con 3 eventos (*Lollapalooza Coca-Cola Stage*, *Lanzamiento Coca-Cola Zero Vainilla*, *Fan Fest Copa Mundial*), actividades, productos, 200 participantes y feedback sintético.

### US-42 — Simulador de WhatsApp para desarrollo · ⚙️ · Should · 3 SP
**Como** desarrollador **quiero** un simulador de chat en el admin (solo en `development`) que llame al mismo caso de uso que el webhook **para** probar el bot sin Meta.
