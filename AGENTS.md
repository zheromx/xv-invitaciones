# Plataforma de Invitaciones Digitales — XV Años

Contexto persistente del proyecto. Lee esto completo antes de proponer estructura, esquema o código nuevo.

## Qué es esto

Plataforma para crear, gestionar y confirmar invitaciones digitales de eventos de XV años. Esta primera versión se construye para resolver un caso real: un evento con ~300 asistentes a inicios de noviembre, enviado por el cliente con ~1 mes de anticipación.

Documento de alcance completo: `ALCANCE.md` (leer antes de tocar el modelo de datos).

## Modelo de dominio (fijo, no reinterpretar)

La unidad central es la **Invitación**, no el invitado individual. Una invitación agrupa a una o varias personas (familia o grupo con un cupo).

```
Evento
 └─ Invitación
     ├─ título            ("Familia Rodríguez" / "Juan Rodríguez")
     ├─ token único        (largo, aleatorio, no incremental — es la autenticación del invitado)
     ├─ respondida          (booleano)
     ├─ enviada_en          (fecha, para calcular el límite de respuesta)
     └─ Persona[]
          ├─ nombre
          └─ asiste          (sí/no — se fija UNA SOLA VEZ al confirmar)
```

Reglas de negocio no negociables para esta versión:

- El RSVP se envía **una sola vez por invitación**. El invitado abre el link, ve los nombres marcados por defecto, desmarca a quien no asistirá, y presiona "Confirmar asistencia" una única vez.
- Al confirmar, la invitación queda en **modo solo lectura permanente**. No hay edición posterior desde la vista pública.
- Cualquiera que abra el link puede marcar a cualquier nombre del grupo (no se restringe por "quién es quién" — normalmente una sola persona confirma por toda la familia).
- Si la invitación no se responde antes de la fecha límite, se considera que **nadie de ese grupo asiste**. Esto es solo informativo por ahora: no hay vencimiento automático ni borrado automático. El cliente decide manualmente qué hacer con las invitaciones sin respuesta, usando el panel como referencia visual.
- No existe estado "pendiente" por persona. Solo existen dos momentos: antes de responder (invitación completa sin respuesta) y después de responder (cada nombre queda fijo en sí/no).

## Autenticación

- **Cliente (organizador):** login propio al panel de administración (NextAuth/Auth.js). Un solo usuario/evento por ahora, pero modela la relación `Evento` con un `usuario_id` desde ya para no reescribir esto después.
- **Invitado:** sin login. El token en la URL es toda la autenticación (`/invitacion/[token]`).

## Alcance de ESTA versión — no construir de más

Incluido:
- Panel privado (CRUD de invitaciones: crear, editar, borrar, copiar link)
- Selector de plantilla: **al menos 4 plantillas** propias (componentes parametrizados por los mismos datos del evento, NO un editor visual ni constructor drag-and-drop). El usuario final solo elige entre las plantillas ya construidas; no las edita ni personaliza su estructura.
- Vista previa: con los datos capturados hasta el momento (aunque el evento no esté completo), el organizador puede ver cómo se renderiza la invitación en la plantilla elegida, antes de compartir cualquier link real
- Captura en el panel: nombre de la quinceañera, nombre de padres, fecha/hora/lugar de ceremonia religiosa y de recepción, cronograma del evento (lista ordenada de momentos con hora + título + ícono), código de vestimenta, foto principal + galería de al menos 4 fotos
- Cuenta regresiva en la página pública (cálculo en cliente a partir de la fecha del evento, sin lógica de servidor)
- Sección de regalos opcional (mensaje, datos bancarios en texto libre, uno o varios links externos de mesa de regalos — ej. Amazon, Mercado Libre, Liverpool; solo son links, no hay integración con esas tiendas) — activable/desactivable desde el panel
- Página pública de invitación con RSVP por nombre (según la plantilla elegida)
- Dashboard simple: invitaciones respondidas/sin responder, total de personas confirmadas
- Compartir por WhatsApp vía `wa.me` (link + texto prellenado, sin API)

**Prioridad si el tiempo aprieta** (recortar de abajo hacia arriba, en este orden):
1. 1 plantilla completa + RSVP + panel + datos del evento + cronograma + galería — innegociable
2. Cuenta regresiva — barata, casi siempre entra
3. Plantillas 2, 3 y 4 — mejor 1 impecable que 4 a medias
4. Sección de regalos — puede lanzarse unos días después sin bloquear el envío

Explícitamente FUERA de esta versión (no lo propongas ni lo agregues por iniciativa):
- Envío automático o masivo por WhatsApp (API de Meta)
- Recordatorios automáticos
- Pases QR / control de acceso
- Acomodo de mesas
- Editor visual de plantillas (constructor drag-and-drop)
- Registro de padrinos por rubro con seguimiento de aportaciones
- Libro de deseos
- Multi-evento por cuenta
- Vencimiento o borrado automático de invitaciones sin respuesta

Si una tarea parece requerir algo de esta lista, avisa antes de implementarlo — probablemente hay una forma más simple de resolverlo dentro del alcance actual.

## Stack

- Next.js (App Router)
- PostgreSQL + Prisma
- Tailwind CSS + shadcn/ui
- NextAuth / Auth.js
- Almacenamiento de imágenes (foto principal + galería): UploadThing o S3-compatible, con redimensionado/optimización al subir (WebP, varios tamaños)
- Despliegue en Vercel

## Estilo de trabajo esperado

- Antes de generar migraciones o reestructurar el schema, muestra el plan primero.
- El panel de administración debe ser simple pero presentable — no inviertas tiempo en pulir su diseño más allá de shadcn/ui por defecto. El esfuerzo de diseño va a la página pública de invitación, que es lo que verán los invitados.
- Prioriza que funcione correctamente en celulares gama baja y con conexión débil (imágenes ligeras, sin animaciones pesadas, sin autoplay de música).
- La vista previa NO es una ruta ni un renderizado aparte: usa el mismo componente de plantilla que ve el invitado, alimentado con los datos actuales del evento (aunque estén incompletos). Evita construir un "modo preview" separado — es una fuente de bugs innecesaria dado el plazo.
- Hay una fecha de envío real cercana. Prefiere soluciones simples y probadas sobre soluciones elegantes que tomen más tiempo.
