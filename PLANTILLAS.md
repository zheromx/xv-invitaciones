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
- **Portada:** usa `Evento.fotoPrincipalUrl` si existe; si no, conserva el
  placeholder visual actual (degradado + arcos decorativos).
- **Galería — excepción aprobada (2×3):** la sección `Galería` usa una
  composición **2 columnas × hasta 3 filas (máximo 6 posiciones)** para mostrar
  hasta 6 fotos reales. Las posiciones sin foto se completan con placeholders
  locales, conservando la paleta y los radios. Esta excepción está **localizada a
  `Galería`** y no modifica ninguna otra sección de la plantilla.
- El resto de secciones (portada, mensaje de padres, detalles del evento, cuenta
  regresiva dinámica, cronograma, RSVP y footer) mantienen su composición
  aprobada sin cambios.
