# Reporte de avance — Plataforma de Invitaciones Digitales XV Años

**Fecha:** 21 de septiembre de 2026 · **Último commit:** `de011a4` · **Working tree:** contiene la ruta real `/invitacion/[token]`, el seed de desarrollo y el RSVP funcional (sin commitear)

---

## 1. Contexto y objetivo

Producto propio para crear, gestionar y confirmar invitaciones digitales de XV años, validado con un evento real de ~300 asistentes (inicios de noviembre, envío con ~1 mes de anticipación).

- **Dominio fijo (AGENTS.md/ALCANCE.md):** la unidad central es la **Invitación** (no el invitado), con token único como autenticación; RSVP **una sola vez**; `asiste` por persona se fija al confirmar; sin vencimiento automático.
- **Stack:** Next.js (App Router) · PostgreSQL + Prisma · Tailwind v4 · shadcn/ui · NextAuth (pendiente) · Vercel.
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

Reglas respetadas: sin imágenes ni URLs remotas (solo gradientes, formas CSS y SVGs propios locales); RSVP puramente visual e inerte (botones sin acciones, sin fetch, sin mutación); cuenta regresiva estática calculada en servidor al renderizar.

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
- **Cuenta regresiva (`cuenta-regresiva.tsx`):** bloque claro con 4 mosaicos y cifras estáticas (alineado al contraste claro de Stitch, sin secuencia de números anteriores).
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

- Datos dev: usuario `desarrollo@invitaciones.local` (contraseña temporal con TODO para hashear con Auth.js), evento con fecha inicios de noviembre.
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
| `npm run lint` | Sin errores |
| `npx tsc --noEmit` | Sin errores |
| `npm run build` | Compilado OK; `/` y `/invitacion/demo` estáticas, `/invitacion/[token]` dinámica |
| `npx prisma db seed` | Ejecutado 2 veces (idempotente) |
| Rutas (runtime `next start`) | López 200 · Martínez 200 · token inventado 404 · demo 200 |
| Checks transaccionales (script temporal) | 15/15 PASS (parcial, todos, nadie, doble envío, id ajeno sin mutación, token inexistente, seed respondida, concurrencia) |

---

## 9. Estado actual y pendientes

**Listo:** base de datos modelada y migrada · plantilla 1 (`ELEGANTE_EUCALIPTO`) alineada a Stitch · demo `/invitacion/demo` · cuenta regresiva · galería/cronograma/mensaje de padres/footer · tipografía self-hosted · ruta real `/invitacion/[token]` con Postgres **· RSVP funcional transaccional e irreversible · seed de desarrollo**.

**Pendiente:**
- Panel de administración + NextAuth (login del organizador).
- CRUD de invitaciones + copiar/compartir link por `wa.me`.
- Plantillas 2, 3 y 4 (`CLASICA_DORADA`, `PASTEL_ROMANTICA`, `MODERNA_MINIMAL`).
- Dashboard de conteo (respondidas, personas confirmadas).
- Sección de regalos (opcional, activable desde el panel).
- Revisión manual en viewport 375 px y pruebas con datos reales del cliente.
- Las 11 pruebas manuales de RSVP del plan (todos/algunos/nadie, doble clic, dos pestañas, token inexistente, id ajeno, ya respondida, error de BD, recarga, demo inerte).
- Commit de la ruta real + seed + RSVP (a un solo commit o por entregable, cuando se indique).