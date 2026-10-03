# 09 · Seguridad y Privacidad

## 1. Autenticación

| Actor | Mecanismo | Detalles |
|-------|-----------|----------|
| Admin | Email + contraseña | Hash **argon2id**. Access JWT 15 min (en memoria del cliente). Refresh token opaco 7 días, rotado en cada uso, guardado hasheado en Redis, cookie `httpOnly; Secure; SameSite=Strict`. |
| Staff | Código de evento + PIN 6 dígitos | PIN hasheado (argon2id). JWT firmado con vida hasta `endsAt + 2h`. Verificación de `revokedAt` en cada request (cacheada 30 s en Redis). |
| Webhook Meta | `X-Hub-Signature-256` | HMAC-SHA256 del body crudo con `WHATSAPP_APP_SECRET`, comparación en tiempo constante. |
| Power BI | Usuario PostgreSQL `bi_reader` | Solo `SELECT` sobre el esquema `analytics` (vistas). Sin acceso a tablas base. |

## 2. Autorización (RBAC)

| Permiso | SUPER_ADMIN | BRAND_MANAGER | ANALYST | STAFF |
|---------|:-:|:-:|:-:|:-:|
| Ver eventos, métricas, feedback | ✅ | ✅ | ✅ | ❌ |
| Crear/editar eventos, actividades, productos, campañas | ✅ | ✅ | ❌ | ❌ |
| Gestionar accesos de staff | ✅ | ✅ | ❌ | ❌ |
| Reprocesar feedback | ✅ | ✅ | ❌ | ❌ |
| Escuchar audios | ✅ | ✅ | ❌ | ❌ |
| Anonimizar participante | ✅ | ❌ | ❌ | ❌ |
| Gestionar admins | ✅ | ❌ | ❌ | ❌ |
| Check-in | ❌ | ❌ | ❌ | ✅ si `canCheckIn` |
| Sampling en actividad X | ❌ | ❌ | ❌ | ✅ si X ∈ `allowedActivityIds` |

Implementación: `@Roles(...)` + `RolesGuard`; `StaffEventGuard` asegura que todo recurso consultado por staff pertenece a su `eventId`.

## 3. Tokens QR

**Formato:** `cei1.<registrationId>.<firma>`
- `firma = base64url( HMAC-SHA256( QR_SIGNING_SECRET, "cei1|" + registrationId + "|" + eventId ) )` truncada a 16 bytes.
- `qr_hash` (columna) = `hex( SHA-256( token ) )` → índice único para búsqueda; el token no se guarda en claro.
- Verificación: se reconstruye la firma con el `eventId` del **token de staff**. Si no coincide → `QR_INVALID` o `QR_WRONG_EVENT` (se distingue revisando si el `registrationId` existe en otro evento, solo para el mensaje).
- **Rotación de secreto:** se admite `QR_SIGNING_SECRET_PREVIOUS` para validar tokens emitidos antes de una rotación.
- El QR no contiene datos personales.

> Mejora sobre la idea original: el HMAC se calculaba sobre `user_id + event_id` sin prefijo de versión ni separador, lo que impedía rotar el esquema y era ambiguo en la concatenación.

## 4. Antifraude

| Amenaza | Control |
|---------|---------|
| Reutilizar QR para varias muestras | `claimNumber` + `UNIQUE` + `FOR UPDATE` (BR-SAM-05/06) |
| Escaneos simultáneos en dos filas | Igual que arriba; probado con test de concurrencia |
| QR falsificado | Firma HMAC (§3) |
| QR de otro evento | Firma ligada a `eventId` + `eventId` del token de staff |
| Captura de pantalla compartida | Check-in único; nombre visible para verificación; alerta en dashboard si se detectan > 3 rechazos del mismo QR |
| Promotor deshonesto entregando sin escanear | Conciliación stock entregado vs. `interactions` por acceso de staff (reporte) |
| Fuerza bruta de PIN | 5 intentos / 15 min por IP+evento (BR-STF-03) |
| Inscripciones masivas con números falsos | Rate limit por número y por evento en el webhook; WhatsApp ya verifica el número |

## 5. Rate limiting (`@nestjs/throttler` + Redis)

| Ruta | Límite |
|------|--------|
| `/auth/admin/login` | 10 / min / IP |
| `/auth/staff/login` | 5 intentos fallidos / 15 min / IP + evento |
| `/scan/*` | 120 / min / staffAccess |
| `/webhooks/whatsapp` | sin límite HTTP (lo controla Meta); limitación por número en el worker: 20 mensajes / min |
| Resto admin | 300 / min / usuario |

## 6. Privacidad y protección de datos

### 6.1 Inventario de datos personales
| Dato | Tabla | Sensibilidad | Retención |
|------|-------|--------------|-----------|
| Teléfono | `participants` | Alta (identificador) | Hasta anonimización |
| Nombre completo | `participants` | Media | Hasta anonimización |
| Rango de edad, ciudad | `participants` | Baja | Se conserva (agregado) |
| Audio de voz | storage (`feedback.audio_key`) | **Alta (biométrico potencial)** | **30 días tras el evento** (BR-PRV-01) |
| Transcripción | `feedback` | Media | Hasta anonimización |
| Consentimientos | `participants` | Evidencia legal | Mientras exista el registro |

### 6.2 Principios aplicados
- **Consentimiento previo:** nada se persiste en `participants` antes de aceptar (borrador en sesión con TTL 24 h) — BR-REG-03.
- **Minimización:** no se piden RUT/DNI, email ni fecha exacta de nacimiento (solo rango).
- **Separación de finalidades:** consentimiento de tratamiento (obligatorio) ≠ marketing (opcional).
- **Derecho de supresión:** comando `BORRAR MIS DATOS` y endpoint admin → anonimización (BR-PRV-02).
- **Seudonimización en analítica:** las vistas BI no tienen nombre ni teléfono (BR-PRV-04).
- **Logs sin PII:** teléfonos enmascarados (`+569****5678`), sin tokens QR ni transcripciones.
- **Proveedores de IA:** solo reciben audio/transcripción, sin identificadores. Usar organización OpenAI con retención cero de datos si está disponible.

### 6.3 Anonimización (`AnonymizeParticipant`)
1. `fullName = 'Anonimizado'`, `phoneNumber = 'anon:' + sha256(phone + ANON_SALT)`, `marketingConsent = false`, `anonymizedAt = now()`.
2. Para cada feedback: borrar audio del storage, `audioKey = null`, `transcription = null`, `executiveQuote = null`, conservar puntajes y `keyTopics`.
3. Borrar `conversation_sessions`.
4. Registrar en `audit_logs` (sin PII).

## 7. Seguridad de la aplicación
- Secretos en variables de entorno / gestor de secretos; nunca en el repositorio.
- HTTPS obligatorio; HSTS; `helmet` con CSP en el frontend (permitir `media-src` del storage y `connect-src` del API).
- Storage privado; acceso solo con URLs firmadas de corta vida.
- Dependencias: `pnpm audit` + Dependabot/Renovate en CI.
- Backups diarios de PostgreSQL con retención de 14 días; prueba de restauración trimestral.
- Revisión de seguridad (OWASP ASVS nivel 1) antes del primer evento real.
