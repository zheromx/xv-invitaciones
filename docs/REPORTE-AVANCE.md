# Reporte de avance — Plataforma de Invitaciones Digitales XV Años

**Fecha:** 21 de septiembre de 2026 · **Último commit:** `40b99fc` — `feat: add gift registry section` · **Working tree:** limpio

---

## 1. Contexto y objetivo

Producto propio para crear, gestionar y confirmar invitaciones digitales de XV años, validado con un evento real de ~300 asistentes (inicios de noviembre, envío con ~1 mes de anticipación).

- **Dominio fijo (AGENTS.md/ALCANCE.md):** la unidad central es la **Invitación** (no el invitado), con token único como autenticación; RSVP **una sola vez**; `asiste` por persona se fija al confirmar; sin vencimiento automático.
- **Stack:** Next.js (App Router) · PostgreSQL + Prisma · Tailwind v4 · shadcn/ui · Auth.js/NextAuth (implementado) · Vercel.
- **Fuera de alcance v1:** envío masivo de WhatsApp, QR, mesas, editor visual de plantillas, padrinos, libro de deseos, multi-evento.

---

## 2. Fundación

- Modelo de datos completo en `prisma/schema.prisma`: `Usuario`, `Evento` (enumeración `Plantilla` con `ELEGANTE_EUCALIPTO`, `cronograma`, `fotosGaleria`, `infoRegalos`), `MomentoEvento`, `FotoGaleria`, `InfoRegalos`/`MesaRegalo`, `Invitacion` (token único + `respondida` + `enviadaEn`), `Persona` (`asiste Boolean?`).
- Migración inicial de PostgreSQL aplicada.
- Historial git base:
  - `935e070 Initial commit from Create Next App`
  - `fb8242a chore: configure Prisma schema and project scope`
  - `73a31ac feat: add initial PostgreSQL schema migration`
  - `ccc8194 chore: align Prisma client version`
  - `de011a4 feat: add elegant eucalyptus invitation demo` (entrega visual commiteada; working tree limpio en ese punto)

---

## 3. Primera entrega visual (página pública con datos mock)

Ruta temporal **`/invitacion/demo`** representando la plantilla **`ELEGANTE_EUCALIPTO`**. 100 % mock, sin Prisma, sin persistencia. Mismo componente de plantilla usado por la vista previa (no hay modo preview separado, según AGENTS.md).

**Conjunto de archivos del entregable:**

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Modificado | `app/page.tsx` | Portada institucional con enlace a la demo |
| Modificado | `app/layout.tsx` | Tipografías `next/font/google` + metadata |
| Modificado | `app/globals.css` | Tokens de diseño (tema de plantilla) |
| Creado | `data/evento-mock.ts` | Mock con forma conceptual del modelo (`Evento`, `Invitacion`, `Persona`, `MomentoEvento`, `FotoGaleria`) |
| Creado | `app/invitacion/layout.tsx` | Layout mínimo con metadata de invitación |
| Creado | `app/invitacion/demo/page.tsx` | Alimenta la plantilla con los mocks |
| Creado | `components/templates/elegante-eucalipto.tsx` | Compone la plantilla parametrizada por props `evento` + `invitacion` |
| Creado | `components/invitacion/{portada,detalles-evento,cuenta-regresiva,cronograma,galeria,rsvp}.tsx` | Secciones de la invitación |
| Creado | `lib/evento.ts` | Tipos de la capa de vista + formateadores `es-MX` y cálculo de cuenta regresiva |

Reglas respetadas: sin imágenes ni URLs remotas (solo gradientes, formas CSS y SVGs propios locales); RSVP puramente visual e inerte (botones sin acciones, sin fetch, sin mutación); cuenta regresiva dinámica en cliente a partir de `Evento.fecha`.

---

## 4. Implementación basada en Stitch (segunda iteración)

### 4.1 Referencia de diseño

- Se consultó el proyecto **Stitch "Invitación Digital XV Años"** (ID `7127983362518170574`) con **5 screens**:
  - `01-panel-dashboard`
  - `02-invitacion-confirmado`
  - `03-invitacion-rsvp-inicial`
  - `04-panel-nueva-invitacion`
  - `05-panel-configuracion-evento`
- Se descargaron **10 assets** a `design/` (5 PNG + 5 HTML), verificados con firma PNG válida.
- Nota metodológica: el modelo del asistente no puede leer imágenes; la referencia se tomó de los HTML de los screens 02/03 + el design system del proyecto Stitch (paleta, tipografías, radios, espaciados).

### 4.2 Design system extraído y aplicado

| Token Stitch | Valor aplicado | Uso |
|---|---|---|
| Primario (bosque) | `#264335` / `#0f2d20` | `eucalipto-700/900`, botones, títulos |
| Secundario (salvia) | `#4c6358` / `#8fa89b` / `#cee9da` | `eucalipto-600/400/200` |
| Terciario (dorado) | `#c5a880` / `#fedeb2` | `dorado`, `dorado-claro` |
| Neutro (marfil) | `#fbf9f6` / `#faf8f5` / `#f5f3f0` | `marfil-claro`, `marfil`, `marfil-osc` |
| Tipografía display | **Playfair Display** | `--font-playfair` → `font-serif/display` |
| Tipografía cuerpo | **Plus Jakarta Sans** | `--font-plus-jakarta` → cuerpo |
| Columna móvil | `max-w-[420px]` | Simula la vista móvil de las screens |
| Elementos | `rounded-full` (píldoras), tarjetas `rounded-2xl`, motivos botánicos, timeline con nodos | Secciones |

Aplicado en `app/globals.css` (escalas de color `eucalipto-*`, `marfil-*`, `dorado-*` + variables `--font-display`/`--font-body` con fallback de sistema) y en `app/layout.tsx` (`Playfair_Display` y `Plus_Jakarta_Sans` vía `next/font/google`, `subsets: ["latin"]`, `display: "swap"`, pesos 400/500/600/700, sin CDN ni requests en runtime, sin paquetes nuevos).

### 4.3 Cambios visuales por sección

- **Portada (`portada.tsx`):** arco `rounded-t-[140px]` (motivo de arco de las screens Stitch), `aspect-[3/4]`, degradé verde bosque + aros decorativos, ramita SVG, chip "Mis XV Años", nombre en Playfair y fecha larga.
- **Mensaje de padres (`mensaje-padres.tsx`, nuevo):** tarjeta con cita propia, iniciales de los padres y divisor.
- **Detalles del evento (`detalles-evento.tsx`):** tarjetas apiladas por bloque (ceremonia/recepción), icono en círculo, hora en píldora, botón "Ver ubicación" **inerte**, bloque de protocolo/vestimenta.
- **Cuenta regresiva (`cuenta-regresiva.tsx`):** bloque claro con 4 mosaicos y **cifras dinámicas en cliente** que se actualizan cada segundo desde `Evento.fecha` (alineado al contraste claro de Stitch).
- **Cronograma (`cronograma.tsx`):** línea continua + nodos de punto sobre tarjeta blanca (`<ol>` semántico), como el timeline de Stitch.
- **Galería (`galeria.tsx`):** grid 2×2 `aspect-square` con placeholders SVG locales.
- **RSVP (`rsvp.tsx`):** dos estados visuales según `respondida`:
  - *Sin responder:* icono de lista, título, N pases, filas con checkbox por persona, aviso "una sola vez", botón "Confirmar asistencia" y "No podré asistir" (inertes).
  - *Confirmada:* badge "respuesta registrada", avatares con iniciales y píldoras "Asistirá/No asistirá", candado de solo lectura.
- **Footer botánico (`footer-botanico.tsx`, nuevo):** ramita + cierre; mes/año derivado de `evento.fecha` con `Intl es-MX` (sin textos hardcodeados).
- **Plantilla (`elegante-eucalipto.tsx`):** columna centrada `max-w-[420px]` con el nuevo orden y composición.

### 4.4 Ajustes puntuales de cierre

- Sampleo visual de los dos estados RSVP mediante el campo `respondida` en el mock.
- Eliminación del texto hardcodeado "Noviembre 2026" del footer en favor de fecha derivada (última corrección aprobada).

---

## 5. Ruta real `/invitacion/[token]` con PostgreSQL

Conexión real del template a la base de datos, sin tocar la plantilla ni la demo:

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `lib/prisma.ts` | Singleton de `PrismaClient` vía `globalThis` (evita conexiones duplicadas en dev) |
| Creado | `lib/invitacion.ts` | `obtenerInvitacionPorToken(token)` → mapea `Evento`/`Invitacion`/`Persona`/`MomentoEvento`/`FotoGaleria` a los tipos de vista (`DatosEvento`, `InvitacionDemo`); devuelve `{ evento, invitacion }` o `null`. El mapper preserva `asiste: boolean | null` |
| Creado | `app/invitacion/[token]/page.tsx` | `await params` → consulta → `notFound()` si no existe → renderiza `EleganteEucalipto` con `token` |
| Creado | `app/invitacion/not-found.tsx` | 404 propio: "Link no válido" |

- La ruta es **dinámica** (generada on-demand); la demo sigue **estática**.
- Misma plantilla para demo y producción (`EleganteEucalipto`); la demo se identifica con la prop `demostracion`.
- `PersonaDemo` incluye `id` (los nombres jamás se usan como identificador) y `asiste: boolean | null`.

## 6. Seed de desarrollo

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `prisma/seed.ts` | Seed idempotente (upserts): 1 usuario dev, 1 evento, cronograma y galería, y **2 invitaciones de prueba** |
| Modificado | `package.json` | `"prisma": { "seed": "tsx prisma/seed.ts" }` |
| Modificado | `README.md` | Sección "Seed de desarrollo" |

- Datos dev: usuario `desarrollo@invitaciones.local` (contraseña dev hasheada con **bcryptjs** vía `hashContrasena`; ya no hay contraseña plana ni TODO de hash), evento con fecha inicios de noviembre.
- Incentiva de prueba:
  - `/invitacion/dev-familia-lopez-sin-responder-2026` → `respondida=false`, 3 personas `asiste=null`.
  - `/invitacion/dev-familia-martinez-respondida-2026` → `respondida=true`, personas `asiste=true/true/false`.
- Ejecutado dos veces consecutivas sin errores (idempotente). Re-ejecutarlo restaura el estado "sin responder" para repetir pruebas.

---

## 7. RSVP funcional, persistente, transaccional e irreversible

Siguiendo las reglas de negocio (responder una sola vez por invitación; solo lectura después de confirmar; token como autenticación; `Persona.id` como identificador; nunca `Invitacion.id`/`invitacionId` del navegador).

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `lib/rsvp-nucleo.ts` | Núcleo transaccional puro (testeable sin Next): `ejecutarConfirmacion(token, personaIdsQueAsisten)` + `idsLimpios` (dedupe + filtrado de vacíos) |
| Creado | `lib/acciones-rsvp.ts` | Server Action `confirmarAsistencia` (`"use server"`); validación runtime estricta de entrada; `revalidatePath` tras éxito |
| Creado | `components/invitacion/rsvp-formulario.tsx` | Único componente cliente: checkboxes, estado local, envío, errores |
| Modificado | `components/invitacion/rsvp.tsx` | Decide la vista: `Confirmada` (bloqueada) · `RsvpFormulario` (ruta real sin responder) · `SinResponder` (demo inerte) |
| Modificado | `components/templates/elegante-eucalipto.tsx` | Nueva prop opcional `token` |
| Modificado | `app/invitacion/[token]/page.tsx` | Pasa `token` a la plantilla |

### 7.1 Contrato de la Server Action

- Entrada: `{ token: string; personaIdsQueAsisten: string[] }` (nada más; la invitación se deriva del token).
- Validación runtime *antes* del `try`: `personaIdsQueAsisten` debe ser arreglo de strings; si no → `{ ok: false, motivo: "ids-invalidos" }`.
- Respuesta: `{ ok: true }` o `{ ok: false, motivo }` con `motivo ∈ {"no-encontrada", "ya-respondida", "ids-invalidos", "fallo"}`. `"fallo"` captura solo errores reales de BD (nunca 404 ni éxito falso). No se usa endpoint API.

### 7.2 Atomicidad y concurrencia

```
$transaction(tx =>
  invitacion = findUnique({ where: { token }, select: id, respondida, personas.id })
  if !invitacion            -> "no-encontrada"
  if invitacion.respondida  -> "ya-respondida"
  if personaIds ∉ personas de la invitación -> "ids-invalidos"

  cambiadas = updateMany({ where: { id, respondida: false },
                           data: { respondida: true, respondidaEn: now } })   // CAS atómico
  if cambiadas.count === 0 -> "ya-respondida"   // otra solicitud ganó

  updateMany({ where: { invitacionId, id: { in: personaIdsQueAsisten } },  data: { asiste: true  } })
  updateMany({ where: { invitacionId, id: { notIn: personaIdsQueAsisten } }, data: { asiste: false } })
  return null
)
```

- La guarda `UPDATE ... WHERE respondida = false` (condición de concurrencia sobre la fila) garantiza que **solo una** solicitud cambie `false → true` (doble clic o dos pestañas).
- Todas las `Persona` de la invitación se actualizan en la misma transacción (`in`/`notIn` cubre "todos", "algunos" y "nadie"); cualquier fallo hace rollback completo.
- Verificado con 15 checks automatizados contra la BD de desarrollo (incluido envío simultáneo: exactamente 1 éxito + 1 `ya-respondida`, estado coherente con el ganador), script temporal eliminado después.

### 7.3 UI y accesibilidad

- Selección inicial: todas las personas marcadas (`asiste !== false`, equivale a `asiste ?? true`).
- Durante el envío: botones y checkboxes deshabilitados (spinner), doble clic bloqueado por guarda `enviando`.
- Éxito → `router.refresh()` (+ `revalidatePath` server) → vista `Confirmada` sellada.
- Error → mensaje visible bajo el formulario sin perder la selección local. Si otra pestaña ya respondió → `"ya-respondida"` + refresh al estado real.
- "No podré asistir" desmarca a todos (permite confirmar que nadie asiste).
- Foco visible (accesibilidad): checkboxes `peer` + anillo en el recuadro, y `focus-visible:ring-2` con token `eucalipto-700` en los botones "Confirmar asistencia" y "No podré asistir".
- Demo `/invitacion/demo` sigue **inerte** (sin `token`, con `demostracion`), muestra su aviso y no toca la BD.

---

## 8. Verificaciones ejecutadas

| Comando | Resultado |
|---|---|
| `git diff --check` | Sin errores de whitespace |
| `npm run lint` | Sin errores (RSVP + panel) |
| `npx tsc --noEmit` | Sin errores |
| `npm run build` | Compilado OK; `/login` y `/panel` dinámicas, `/api/auth/[...nextauth]` dinámica; proxy activo |
| `npx prisma db seed` | Ejecutado 2 veces (idempotente); contraseña dev guardada como hash bcrypt (60 chars, prefijo `$2`) |
| Rutas (runtime `next start`) | López 200 · Martínez 200 · token inventado 404 · demo 200 · login 200 |
| Pruebas manuales de login/protección/rutas públicas | Login válido 302→`/panel` · `/api/auth/session` expone `user.id` · contraseña inválida → error · `/panel` sin sesión 302→`/login` · `/login` con sesión 307→`/panel` · logout invalida · públicas 200 (detalle en §9) |
| Checks transaccionales (script temporal) | 15/15 PASS (parcial, todos, nadie, doble envío, id ajeno sin mutación, token inexistente, seed respondida, concurrencia) |

---

## 9. Panel de administración + login con Auth.js

Login del organizador con **Auth.js v5** (Credenciales, sesión **JWT sin adaptador**, sin tablas `Account`/`Session`) y contraseñas con **bcryptjs**. El panel `/panel` queda protegido; el REST permanece público.

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `auth.ts` | `NextAuth`: provider Credentials (busca `Usuario` por email en Postgres + verifica con bcryptjs), `session: { strategy: "jwt" }`, `pages.signIn = "/login"`; callbacks `jwt`/`session` exponen `user.id`; augmentation de `Session` para `user.id: string` |
| Creado | `app/api/auth/[...nextauth]/route.ts` | Re-exporta los handlers Auth.js (`GET`/`POST`) |
| Creado | `proxy.ts` | Convención **proxy** (sustituye `middleware.ts`, deprecado en Next 16), matcher `/panel/:path*`; sin sesión → `Redirect /login` |
| Creado | `lib/hash.ts` | `hashContrasena`/`verificarContrasena` (bcryptjs, sin `@types` extra) |
| Creado | `lib/acciones-auth.ts` | Server Actions `iniciarSesion` (llama `signIn("credentials", …)`; captura `AuthError` → error genérico "Correo o contraseña incorrectos") y `cerrarSesion` |
| Creado | `app/login/page.tsx` | Página pública de login; si ya hay sesión → `redirect("/panel")` |
| Creado | `components/login/formulario-login.tsx` | Único componente cliente: formulario nativo + `useActionState`, error genérico, `focus-visible` |
| Creado | `app/panel/layout.tsx` | Doble barrera: valida sesión en servidor y redirige; header con nombre/email y botón Salir |
| Creado | `app/panel/page.tsx` | Cascarón del panel: resuelve `Evento.usuarioId` de la sesión y muestra estado del evento/sesión (sin CRUD ni métricas) |
| Modificado | `prisma/seed.ts` | Upsert del usuario dev con **hash bcrypt** (`hashContrasena`), sustituye la contraseña plana + TODO |
| Creado | `.env.example` | `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (y `AUTH_TRUST_HOST` comentado como opcional) |
| Modificado | `.gitignore` | Excepción `!.env.example` para versionar el ejemplo |
| Modificado | `README.md` | Sección "Login del panel (Auth.js)" |
| Modificado | `docs/REPORTE-AVANCE.md` | Este reporte |

**Decisiones clave:** misma falla para email inexistente o contraseña inválida (se retorna `null` en `authorize`, sin filtrar cuál falló); `user.id` tipado y estable en la sesión para consumo server-side de `/panel`; sin `SessionProvider` global; el middleware/proxy **no** es la única barrera (el layout valida otra vez). El "No podré asistir"/RSVP y las rutas públicas no se tocaron.

**Pruebas manuales (runtime `next start`):**

| Caso | Resultado |
|---|---|
| `/` y `/invitacion/demo` | 200 |
| `/invitacion/dev-familia-*-2026` (ambos tokens) | 200 |
| `/panel` sin sesión | 302 → `/login` |
| `/login` sin sesión | 200 |
| Login válido (`desarrollo@invitaciones.local` + password dev) | 302 → `/panel`; `/panel` 200 con "evento encontrada y vinculada" |
| `/api/auth/session` con cookie | `user` con `id` del usuario |
| Contraseña inválida | 302 → `/login?error=CredentialsSignin` (y el form da el error genérico) |
| `/login` con sesión activa | 307 → `/panel` |
| `POST /api/auth/signout` | 302 → `/login`; `/panel` vuelve a 302 → `/login` |

---

## 10. CRUD de invitaciones desde el panel + compartir por WhatsApp

Listado, creación, edición y borrado de invitaciones desde el panel, con token aleatorio server-side, URL pública estable y compartir por `wa.me` (sin API). Sigue el mismo patrón de arquitectura que el RSVP (núcleo transaccional puro + Server Action fina).

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `lib/invitaciones-panel.ts` | Helpers server: `obtenerEventoSegunSesion()` (auth → `Evento` del usuario), `detalleInvitacionParaEditar()` |
| Creado | `lib/invitaciones-nucleo.ts` | Núcleo transaccional puro (testeable sin Next): `generarTokenInvitacion()`, `ejecutarCrear`, `ejecutarEditar`, `ejecutarBorrar` |
| Creado | `lib/acciones-invitaciones.ts` | Server Actions `"use server"`: `crearInvitacion`, `editarInvitacion`, `borrarInvitacion` (validación runtime, sesión, `revalidatePath`) |
| Creado | `lib/url-invitacion.ts` | `urlPublicaInvitacion(token)`: `NEXT_PUBLIC_SITE_URL` → fallback `headers()` (proto/host) → `localhost:3000` |
| Creado | `app/panel/invitaciones/page.tsx` | Lista server (`force-dynamic`), ordena `creadaEn desc`, mapea filas con URL absoluta y fecha `Intl es-MX` |
| Creado | `components/panel/lista-invitaciones.tsx` | Tabla cliente: búsqueda/filtro, badges, copiar link (clipboard + toast), WhatsApp, eliminar en fila expandida con confirmación (reforzada si respondida), `Editar` con candado si respondida |
| Creado | `components/panel/confirmacion-borrado.tsx` | Confirmación de eliminación compartida (tabla y detalle): variante estándar y reforzada (respondida requiere escribir `ELIMINAR`), accesible (Escape, `role="alert"`, estado destructivo) |
| Creado | `components/panel/formulario-invitacion.tsx` | Formulario crear/editar/solo-lectura: filas de personas dinámicas, `useActionState`, banner de solo lectura, zona de eliminación administrativa |
| Creado | `app/panel/invitaciones/nueva/page.tsx` · `[id]/editar/page.tsx` | Rutas de creación y edición |
| Modificado | `app/panel/layout.tsx` (nav), `app/panel/page.tsx` (copy), `.env.example` (`NEXT_PUBLIC_SITE_URL`), `README.md` | Documentación y navegación |

### 10.1 Contratos y decisiones de seguridad

- El navegador envía **solo** `Invitacion.id` (cuid); el `eventoId` autorizado se deriva de `session.user.id → Evento.usuarioId` (nunca del request).
- Token: `randomBytes(24).toString("base64url")` (≥30 chars, solo `[A-Za-z0-9_-]`), generado y guardado **solo en servidor**; reintento de inserción ante colisión `P2002` (5 intentos). Editar **nunca** regenera el token → la URL pública queda estable.
- `respondida = true` → **solo lectura para edición**: la página de edición se renderiza sin inputs (banner) y el servidor devuelve `ya-respondida` ante `editar`. La edición (título, personas, token, `respondida`, `respondidaEn`, `asiste`) queda bloqueada permanentemente.
- Borrar, en cambio, es la **única corrección administrativa** permitida también sobre invitaciones respondidas: el organizador autenticado puede eliminarlas **solo si pertenecen a su `Evento`** (derivado de la sesión, nunca del request). Si necesita reemplazarla, se crea una invitación nueva con un token nuevo.
- Confirmación de borrado **inline** (sin modales), en una fila expandida de la tabla y en la zona de eliminación del detalle. Para invitaciones **sin responder**: confirmación estándar que identifica el título. Para **respondidas**: confirmación reforzada — advertencia de eliminación permanente de la invitación y del RSVP registrado, título + cantidad de personas (y cuántas confirmadas), y se exige escribir exactamente `ELIMINAR` para habilitar el botón destructivo. Cancelar o escribir otra cosa no borra nada.
- Edición transaccional: valida `eventoId`, bloquea respondidas, comprueba que cada `persona_id` pertenezca a la invitación, rechaza id conservadas y eliminadas a la vez (`no-autorizado`), inserta/actualiza/elimina personas en la misma transacción.
- Límites runtime de la capa de acción: título ≤ 120 chars, 1–25 personas, nombres trim + dedupe case-insensitive.
- `borrarInvitacion` se invoca como función (no como form action); `editar`/`crear` usan `useActionState`.
- Compartir WhatsApp: `https://wa.me/?text=` con mensaje prellenado que incluye la URL absoluta del token (`¡Hola {titulo}! Están invitados… Confirmen su asistencia aquí: {url}`), abre en `_blank`. Sin API de Meta.
- Origen del enlace: `NEXT_PUBLIC_SITE_URL` (documentada en `.env.example`, sin barra final); sin la variable, fallback a `x-forwarded-proto`/`x-forwarded-host` (dev: `http://localhost:3000`).

### 10.2 Verificaciones

| Comando | Resultado |
|---|---|
| `git diff --check` | Sin errores de whitespace |
| `npm run lint` | 0 errores |
| `npx tsc --noEmit` | 0 errores (incluyó fix de `headers()` async en Next 16 y tipado de `useActionState`) |
| `npm run build` | Compilado OK; `/panel/invitaciones*`, `nueva`, `[id]/editar` dinámicas; proxy activo sobre `/panel/:path*` |
| `npx prisma db seed` | Idempotente (estado base restaurado antes de checks) |
| Checks de núcleo (script temporal, eliminado) | **24/24 PASS** (CRUD v1): crear+tokens, editar sin cambiar token, renombrado/agregar/quitar personas, respondida bloqueada ante edición sin mutación, id de otra invitación y otro evento → `no-autorizado`, borrado/ajena/inexistente, cascade |
| Checks de nueva política de borrado (script temporal, eliminado) | **15/15 PASS**: crear fixture respondida; borrar respondida ajena → `no-autorizado` (existe, sin fuga); inexistente → `no-encontrada`; editar respondida sigue `ya-respondida` y no muta; borrar respondida propia → OK con cascade y token sin resolver en BD; borrar sin confirmar → OK; crear→borrar OK |
| Runtime (`next start`, sesión real por login + cookies) | `/panel/invitaciones` autenticada 200 con filas, URLs absolutas `http://localhost:3000/invitacion/dev-*`, papelera visible en filas respondidas y no respondidas (`aria-controls="confirmar-borrado-…"`); detalle respondida → solo lectura + zona de eliminación sin `Guardar cambios`; sin sesión lista y editar → 302 `/login`; públicas 200/200/404/200; **token de invitación respondida borrada: 200 antes → 404 después** |

### 10.3 Registro del commit

| Campo | Valor |
|---|---|
| Commit | `5d768e2` |
| Mensaje | `feat: CRUD de invitaciones desde el panel + compartir WhatsApp (politica de borrado con confirmacion reforzada)` |
| Fecha | 21 de septiembre de 2026 (sobre `a5754ad`) |
| Contenido | §10 completo: CRUD (lista/crear/editar/eliminar), token server-side, solo lectura para edición, política de borrado administrativo con confirmación reforzada, share WhatsApp, chequeos de núcleo y rutas runtime |
| Estado | Working tree **limpio** tras este commit y el submódulo de documentación del reporte |

---

## 11. Dashboard de conteo

Métricas agregadas de confirmación en `/panel`, con la identidad visual actual del panel y estructura inspirada en `design/01-panel-dashboard.html`.

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `lib/dashboard-panel.ts` | `obtenerMetricasDashboard()` (auth → `Evento` de la sesión) + `obtenerMetricasDeEvento(eventoId)` (agregaciones `groupBy`) |
| Modificado | `app/panel/page.tsx` | Dashboard de solo lectura: 5 tarjetas de métricas + nota contextual de personas en invitaciones sin responder |

- **Ruta:** `/panel` (server-rendered, `force-dynamic`).
- **Métricas:** invitaciones totales, respondidas y sin responder; personas confirmadas (`asiste=true`) y declinadas (`asiste=false`); y **"Personas en invitaciones sin responder"** para `asiste=null` (dato contextual, no un estado individual pendiente).
- **Autorización:** `Evento` derivado **server-side** de `session.user.id → Evento.usuarioId`; el navegador no envía ni puede fijar `eventoId`/`usuarioId`.
- **Implementación:** `groupBy` sobre `Invitacion.respondida` y `Persona.asiste` (`_count._all`), sin cargar colecciones completas.
- **UI:** estructura de 5 tarjetas equivalente a `design/01-panel-dashboard.html`, manteniendo la identidad actual del panel (tokens `eucalipto`/`zinc`, `font-serif`), sin tema paralelo.
- **Alcance:** dashboard de **solo lectura**; no altera RSVP, CRUD, tokens, Auth.js, rutas públicas, schema ni seed.
- **Validaciones:** `git diff --check`, `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores; validación manual contra el estado canónico del seed **2/1/1/2/1/3** (2 invitaciones · 1 respondida · 1 sin responder · 2 confirmadas · 1 declinada · 3 personas en invitaciones sin responder).

### 11.1 Registro del commit

| Campo | Valor |
|---|---|
| Commit | `86cad6e` |
| Mensaje | `feat: add invitation response dashboard` |
| Fecha | 21 de septiembre de 2026 (sobre `5d768e2`) |
| Contenido | `lib/dashboard-panel.ts` (nuevo), `app/panel/page.tsx` (dashboard de conteo) y `docs/REPORTE-AVANCE.md` (§11) |
| Estado | Comiteado; working tree limpio tras el commit del entregable y la actualización de este reporte |

---

## 12. Configuración editable del evento

Datos base del evento, sedes, protocolo, cronograma y selector limitado de plantilla, con vista previa que reutiliza el componente público.

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `lib/evento-panel.ts` | `obtenerEventoConfiguracionSesion()` (auth → `Evento` de la sesión + `MomentoEvento` ordenados) y `obtenerVistaPreviaSesion()` (arma `DatosEvento`/`InvitacionDemo` sin persistir ni firmar RSVP) |
| Creado | `lib/evento-validacion.ts` | Validación runtime pura de `FormData` → `DatosEventoActualizables` (o `null`) |
| Creado | `lib/evento-nucleo.ts` | Núcleo transaccional testeable sin Next: `ejecutarActualizarEvento(usuarioId, datos)` actualiza `Evento` + sincroniza `MomentoEvento` en una transacción |
| Creado | `lib/acciones-evento.ts` | Server Action fina `actualizarEvento` (auth → validación → mutación → `revalidatePath`) |
| Creado | `lib/plantillas.ts` | Catálogo de plantillas con disponibilidad (solo `ELEGANTE_EUCALIPTO`) |
| Creado | `components/panel/formulario-evento.tsx` | Formulario cliente por bloques, cronograma con Subir/Bajar y selector de plantilla |
| Creado | `app/panel/configuracion/page.tsx` · `app/panel/configuracion/vista-previa/page.tsx` | Rutas protegidas |
| Modificado | `app/panel/layout.tsx` (nav), `app/panel/page.tsx` (acceso) | Enlaces a la configuración |

- **Alcance editable:** datos generales (quinceañera, padre, madre, padrinos), fecha y fecha límite de RSVP, ceremonia (con `tieneMisa`; si es `false` los tres campos de misa quedan `null` en BD y no se piden en UI), recepción obligatoria, protocolo (vestimenta e info adicional), cronograma y plantilla.
- **Seguridad:** el navegador nunca envía `eventoId`/`usuarioId`; el `Evento` se deriva de `session.user.id → Evento.usuarioId` y los `MomentoEvento.id` se validan contra ese evento dentro de la transacción (`no-autorizado` si no pertenecen). No se toca `Invitacion`, `Persona`, token, RSVP ni `respondida`.
- **Cronograma:** crear/editar/eliminar/reordenar con controles Subir/Bajar (sin drag-and-drop); conserva `MomentoEvento.id` de filas existentes y persiste el orden secuencial `0..n-1`, todo dentro de la transacción.
- **Plantilla:** solo `ELEGANTE_EUCALIPTO` es seleccionable; `CLASICA_DORADA`, `PASTEL_ROMANTICA` y `MODERNA_MINIMAL` se muestran como "Próximamente", deshabilitadas y sin modificar el valor guardado.
- **Vista previa:** `/panel/configuracion/vista-previa` **reutiliza `EleganteEucalipto`** (el mismo componente del invitado), sin modo preview ni layout/plantilla paralelos; usa una invitación representativa del evento o un objeto mínimo interno (sin persistir ni generar token) y no activa el RSVP (no se pasa `token`).
- **Revalidación:** `/panel/configuracion`, `/panel` y `/invitacion/[token]` (patrón dinámico).
- **Validaciones:** `git diff --check`, `npm run lint`, `npx tsc --noEmit`, `npm run build` y `npx prisma db seed` sin errores; **21/21 checks** de núcleo contra la BD dev (script temporal eliminado) cubriendo persistencia, misa on/off, alta/edición/borrado/reorden del cronograma con IDs preservados, rechazo de momento de otro evento sin mutación parcial y RSVP intacto; runtime con sesión dev: `/panel/configuracion` 200 (sin sesión 302 → `/login`), vista previa 200 con RSVP inerte, públicas 200 y `/invitacion/demo` inerte.

### 12.1 Cuenta regresiva dinámica (cliente)

La sección de cuenta regresiva de `ELEGANTE_EUCALIPTO` dejó de calcularse en servidor y ahora es un **contador dinámico en el cliente**, sin rediseñar la plantilla.

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Modificado | `components/invitacion/cuenta-regresiva.tsx` | Client component: mismo contrato `{ evento }` y misma composición visual; recalcula cada segundo |
| Modificado | `lib/evento.ts` | `duracionHasta(fecha, ahora?)`: parámetro opcional retrocompatible y clamp de fecha pasada/inválida a `0` |

- **Comportamiento:** calcula la diferencia entre la hora actual y `Evento.fecha` en el cliente, muestra días/horas/min/seg y se actualiza cada segundo con `setInterval`, limpiado en el cleanup al desmontar. Si la fecha ya pasó o es inválida, muestra `00` en los cuatro valores (sin negativos ni `NaN`).
- **Hidratación:** estado inicial estable (`ahora = null`); SSR y el primer render del cliente muestran `00`, y el cálculo arranca en `useEffect` (post-hidratación), evitando mismatches. La fecha larga (sensible a zona horaria/locale) usa `suppressHydrationWarning` y solo se renderiza si la fecha es válida.
- **Alcance:** funciona en `/invitacion/[token]`, `/invitacion/demo` y `/panel/configuracion/vista-previa`; sin animaciones pesadas, requests ni dependencias nuevas. No altera RSVP: demo y vista previa siguen inertes.
- **Validaciones:** `git diff --check`, `npm run lint`, `npx tsc --noEmit` y `npm run build` en verde; runtime 200 con la sección presente y 4 celdas en el estado inicial `00`; pública con RSVP interactivo y demo/vista previa inertes.

### 12.2 Registro del commit

| Campo | Valor |
|---|---|
| Commit | `30d8f17` |
| Mensaje | `feat: add editable event configuration` |
| Fecha | 21 de septiembre de 2026 (sobre `86cad6e`) |
| Contenido | Configuración editable del evento + vista previa que reutiliza el componente público + cuenta regresiva dinámica en cliente |
| Estado | Working tree limpio tras este commit |

---

## 13. Foto principal + galería editable (UploadThing v7)

Subida real de imágenes con **UploadThing v7** (`uploadthing@7.7.4` + `@uploadthing/react@7.3.3`), persistencia autorizada server-side y borrado físico; la galería pública pasa a grid 2×3 (excepción aprobada, localizada a `Galería`).

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `app/api/uploadthing/core.ts` | File Router (`fotoPrincipal`, `fotoGaleria`: `image`, máx 4 MB, 1 archivo). `.middleware()` valida sesión Auth.js y deriva el Evento de `session.user.id → Evento.usuarioId`; `onUploadComplete` devuelve `{ url: file.ufsUrl }` |
| Creado | `app/api/uploadthing/route.ts` | `createRouteHandler({ router })` (v7), runtime nodejs; accesible para callbacks de UploadThing (no protegido por proxy global) |
| Creado | `lib/imagenes-evento.ts` | Constantes centrales (`MAX_FOTOS_GALERIA = 6`, `MAX_FOTO_PRINCIPAL = 1`, `MAX_TAMANO_IMAGEN_BYTES`, tipos permitidos) y validación/derivación de key (`claveDesdeUrlUploadThing`, `urlUploadThingValida`) |
| Creado | `lib/imagenes-nucleo.ts` | Núcleo transaccional (testeable sin Next): guardar/eliminar principal, agregar/eliminar/reordenar galería, cupo máximo, orden secuencial `0..n-1` |
| Creado | `lib/acciones-imagenes.ts` | Server Actions autorizadas + `UTApi.deleteFiles` (borrado físico) |
| Creado | `lib/uploadthing.ts` | Helpers cliente v7 (`generateReactHelpers` → `useUploadThing`) |
| Creado | `components/panel/imagenes-evento.tsx` | Bloque "Imágenes" del panel: subir/reemplazar/eliminar principal; galería hasta 6 con Subir/Bajar/eliminar |
| Modificado | `app/panel/configuracion/page.tsx`, `components/invitacion/portada.tsx`, `components/invitacion/galeria.tsx`, `lib/evento.ts`, `lib/invitacion.ts`, `lib/evento-panel.ts`, `next.config.ts`, `.env.example` | Ruta del bloque, portada con foto real, galería 2×3, mapper/preview, `remotePatterns`, `UPLOADTHING_TOKEN` |

- **Límites:** 1 foto principal; máximo **6** en galería (constante central `MAX_FOTOS_GALERIA`, sin migración); JPG/PNG/WebP; 4 MB por archivo; una imagen por operación.
- **Seguridad:** el navegador nunca envía `eventoId`/`usuarioId`; el Evento se deriva de la sesión; las URLs se persisten **solo** por Server Actions autorizadas que validan que sean URLs de UploadThing; para borrar/reemplazar se valida pertenencia por `FotoGaleria.id`; la key de borrado físico se **deriva server-side** de la URL persistida (nunca se acepta del cliente).
- **Borrado físico:** `UTApi.deleteFiles(key)` (v7) tras una mutación de BD exitosa; si falla, se registra y no se revierte la BD.
- **Plantilla pública:** portada usa `Evento.fotoPrincipalUrl` si existe (si no, placeholder actual); galería **2 columnas × hasta 3 filas (máx 6)**, con fotos reales ordenadas y placeholders locales para posiciones faltantes; demo conserva placeholders sin UploadThing; preview reutiliza la plantilla y sigue inerte para RSVP.
- **Validaciones:** `git diff --check`, `npm run lint`, `npx tsc --noEmit`, `npm run build` y `npx prisma db seed` en verde. E2E real contra la cuenta v7 ejecutando el **cliente v7** (`genUploader`, misma ruta que la UI; script temporal eliminado): **16/16 PASS** — subida sin sesión rechazada; subida autenticada de principal y galería con URL/key válidas; persistencia; render en ruta pública; reemplazo con borrado físico de la anterior (y la key ya no resuelve); eliminación con borrado físico; 6/7.ª; reorden secuencial; aislamiento entre eventos.

---

## 14. Regalos y mesas de regalo

Sección opcional controlada por `InfoRegalos.mostrar`, con mensaje libre, datos bancarios (texto libre) y hasta cinco mesas de regalo (tienda + URL externa), ordenables. Bloque y mutación **separados** de la configuración base del Evento.

| Tipo | Archivo | Responsabilidad |
|---|---|---|
| Creado | `lib/regalos-validacion.ts` | Validación runtime pura + `urlHttpsValida` (https + hostname). Límites: mensaje 1000, datos 2000, número 200, mesas 5, tienda 100, url 2000 |
| Creado | `lib/regalos-nucleo.ts` | Núcleo transaccional (testeable sin Next): upsert de `InfoRegalos` + sincronización de `MesaRegalo` (crear/editar/eliminar, orden `0..n-1`) |
| Creado | `lib/acciones-regalos.ts` | Server Action fina `actualizarRegalos` (auth → validación → núcleo → `revalidatePath`) |
| Creado | `components/panel/regalos-evento.tsx` | Bloque "8. Regalos" del panel: switch, campos y lista dinámica (máx 5) con Agregar/Eliminar/Subir/Bajar |
| Creado | `components/invitacion/regalos.tsx` | Sección pública reutilizable (entre Galería y RSVP) |
| Modificado | `lib/evento.ts`, `lib/invitacion.ts`, `lib/evento-panel.ts`, `components/templates/elegante-eucalipto.tsx`, `app/panel/configuracion/page.tsx` | Tipos/mappers (`infoRegalos`), helper `obtenerRegalosEventoSesion`, inserción en la plantilla y bloque en la página |

- **Visibilidad:** la sección pública (y la preview, que reutiliza la misma plantilla) solo se renderiza si `mostrar === true` y hay contenido útil; con `mostrar=false` los datos se **conservan** pero no se muestran.
- **Contenido útil:** al activar, se exige al menos uno: mensaje, datos bancarios, número de evento o una mesa válida.
- **Validación (guardar y leer):** cada mesa requiere tienda y URL **https:// con hostname**; se rechazan `http`, `javascript:`, `data:`, URLs malformadas y sin host; máximo 5 mesas; filas vacías se ignoran y filas parciales se rechazan; ids duplicados rechazados. `urlHttpsValida` se aplica también en el render público (datos históricos nunca generan enlaces inseguros).
- **Seguridad:** el navegador no envía `eventoId`/`usuarioId`/`infoRegalosId`; el Evento se deriva de la sesión y los `MesaRegalo.id` se validan por pertenencia dentro de la transacción (`no-autorizado` en caso contrario). Enlaces públicos con `target="_blank"` y `rel="noopener noreferrer"`.
- **Alcance:** solo enlaces externos; **sin** pago, checkout, scraping, API de tiendas, seguimiento de aportaciones ni afiliados.
- **Validaciones:** `git diff --check`, `npm run lint`, `npx tsc --noEmit`, `npm run build` y `npx prisma db seed` en verde; **21/21** checks de validación/núcleo y **10/10** de runtime (scripts temporales eliminados): persistencia y orden, ocultar conserva datos, `mostrar=true` sin contenido → inválido sin mutación, URLs y filas parciales inválidas, reorden/edición/eliminación con ids preservados, mesa ajena → `no-autorizado` sin mutación, y `Evento`/`Invitacion`/`Persona`/RSVP intactos; runtime: pública muestra/oculta según `mostrar` con enlaces seguros, preview refleja regalos con RSVP inerte, panel sin sesión → `/login`, demo sin regalos.

---

## 15. Estado actual y pendientes

**Listo:** base de datos modelada y migrada · plantilla 1 (`ELEGANTE_EUCALIPTO`) alineada a Stitch · demo `/invitacion/demo` · cuenta regresiva dinámica en cliente desde `Evento.fecha` (días/horas/min/seg, `00` si la fecha ya pasó o es inválida) · galería/cronograma/mensaje de padres/footer · tipografía self-hosted · ruta real `/invitacion/[token]` con Postgres **· RSVP funcional transaccional e irreversible · seed de desarrollo** · **Panel de administración + login del organizador con Auth.js v5**: provider **Credentials** (email + contraseña) con sesión **JWT** (sin adaptador, sin tablas `Account`/`Session`), contraseñas verificadas con **bcryptjs**; **login** (`/login`) y **logout** desde el header del panel; **`/panel` protegido** por `proxy.ts` + validación server-side en el layout; **autorización** server-side por `Usuario.id` de la sesión para resolver `Evento.usuarioId`; seed de desarrollo con contraseña **hasheada** (bcrypt) · **CRUD de invitaciones desde el panel** (lista, crear, editar, eliminar) con token aleatorio server-side, URL estable, solo lectura para **edición** cuando `respondida` y **eliminación administrativa de respondidas** con confirmación reforzada (requiere escribir `ELIMINAR`), seguridad por `Evento.usuarioId` de sesión y **compartir por WhatsApp** vía `wa.me` con texto prellenado (§10) · **Dashboard de conteo** en `/panel` (solo lectura, con métricas agregadas del evento derivado de la sesión) — §11 · **Configuración editable del evento** en `/panel/configuracion` (datos generales, fecha/RSVP, ceremonia, recepción, protocolo, cronograma y selector limitado de plantilla) con **vista previa** en `/panel/configuracion/vista-previa` que **reutiliza el componente público** `EleganteEucalipto` (no es un modo separado) — §12 · **Foto principal + galería editable** con **UploadThing v7** (1 principal, máx 6 en galería con orden y borrado físico) y **galería pública 2×3** — §13 · **Regalos y mesas de regalo** (opcional con `mostrar`, mensaje, datos bancarios, número de evento y hasta 5 mesas con URL https:// y borrado/orden) — §14.

**Pendiente:**
- Plantillas 2, 3 y 4 (`CLASICA_DORADA`, `PASTEL_ROMANTICA`, `MODERNA_MINIMAL`).
- Revisión manual en viewport 375 px y pruebas con datos reales del cliente.
- Las 11 pruebas manuales de RSVP del plan (todos/algunos/nadie, doble clic, dos pestañas, token inexistente, id ajeno, ya respondida, error de BD, recarga, demo inerte).
