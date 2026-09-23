# Plantillas de invitación

Plantillas construidas como componentes propios parametrizados por los datos del
`Evento` (no un editor visual ni constructor drag-and-drop). El organizador solo
elige entre las plantillas ya construidas; no edita su estructura.

| Valor (`Evento.plantilla`) | Nombre | Estado |
|---|---|---|
| `ELEGANTE_EUCALIPTO` | Elegante Eucalipto | Implementada (única seleccionable hoy) |
| `CLASICA_DORADA` | Clásica Dorada | Pendiente |
| `PASTEL_ROMANTICA` | Pastel Romántica | Pendiente |
| `MODERNA_MINIMAL` | Moderna Minimal | Pendiente |

## Reglas de composición

- Se conservan paleta, tipografía, radios, columna móvil (`max-w-[420px]`) y
  espaciado del ADN Stitch de `ELEGANTE_EUCALIPTO`.
- **Orden de secciones — excepción aprobada:** el orden de composición es
  **Portada → Mensaje de padres → Cuenta regresiva → RSVP → Detalles del evento →
  Cronograma → Galería → Regalos → Footer**. Solo cambia el orden; no se
  rediseñan secciones ni cambian colores, tipografías o estructura interna.
- **Mensaje de padres:** usa `Evento.mensajePadres` cuando tiene texto útil
  (preservando saltos de línea); si es `null`/vacío, conserva el texto fijo
  actual.
- **Portada:** usa `Evento.fotoPrincipalUrl` si existe; si no, conserva el
  placeholder visual actual (degradado + arcos decorativos).
- **Galería — excepción aprobada (2×3):** la sección `Galería` usa una
  composición **2 columnas × hasta 3 filas (máximo 6 posiciones)** para mostrar
  hasta 6 fotos reales. Las posiciones sin foto se completan con placeholders
  locales, conservando la paleta y los radios. Esta excepción está **localizada a
  `Galería`** y no modifica ninguna otra sección de la plantilla.
- **Visor de galería:** las fotos reales abren un visor ligero (clic/tap, fondo
  oscuro, imagen sin recorte, cierre con botón/Escape/fondo, navegación y bloqueo
  de scroll). Los placeholders/demo no abren visor. No usa librerías nuevas.
- **Ubicaciones:** "Ver ubicación" es un enlace a Google Maps Search construido
  desde `misaDireccion`/`recepcionDireccion`; sin dirección no se renderiza.
- El resto de secciones (detalles del evento, cuenta regresiva dinámica,
  cronograma, RSVP y footer) mantienen su composición aprobada sin cambios.
