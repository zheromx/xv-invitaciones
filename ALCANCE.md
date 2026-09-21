# Plataforma de Invitaciones Digitales para XV Años

**Descripción de proyecto**

Sistema propio para crear, gestionar y confirmar invitaciones digitales de eventos de quince años, desarrollado como producto propio y validado con un primer evento real.

| | |
|---|---|
| **Vertical inicial** | XV años |
| **Modelo** | Solo desarrollador |
| **Primer caso de uso** | Evento real, ~300 asistentes |
| **Fecha del evento** | Inicios de noviembre |

---

## Qué es el proyecto

Una plataforma web para crear invitaciones digitales de XV años que resuelve, en un solo lugar, lo que hoy se hace disperso entre imágenes de WhatsApp, llamadas y hojas de cálculo: la invitación, la confirmación de asistencia y el conteo de invitados. No es un generador de imágenes bonitas — es una herramienta operativa donde el diseño acompaña, pero no reemplaza, la función de organizar el evento.

El desarrollo arranca resolviendo un caso real (un evento de ~300 asistentes a inicios de noviembre) y ese primer uso define el alcance del producto inicial. Las funciones que no resuelven ese caso quedan documentadas como visión a futuro, no como parte de esta primera versión.

## Cómo funciona (modelo del producto)

La unidad central no es el "invitado" sino la **invitación**, porque en la práctica no se invita a personas sueltas sino a familias o grupos con un cupo:

```
Invitación
 ├─ título            ("Familia Rodríguez" / "Juan Rodríguez")
 ├─ link único (token) — una sola URL para todo el grupo
 ├─ respondida         (sí/no)
 └─ Personas[]
      ├─ nombre
      └─ asiste: sí / no   (se fija una sola vez, al confirmar)
```

Cada invitación se administra desde un panel privado y se comparte por WhatsApp como un link personalizado. Al abrir el link, el destinatario ve los nombres del grupo (marcados por defecto) y desmarca a quienes no asistirán. Al confirmar, la respuesta queda fija: la invitación pasa a modo solo lectura y ya no se puede editar. Si no se responde antes de la fecha límite indicada en la propia invitación, se considera que nadie de ese grupo asistirá; por ahora esto es solo informativo y el cliente decide manualmente qué hacer con las invitaciones sin respuesta.

El evento en sí (una plantilla, elegida entre al menos 4 disponibles) incluye: nombre de la quinceañera y de los padres, fecha/hora/lugar de ceremonia religiosa y recepción, cronograma del evento, código de vestimenta, cuenta regresiva, foto principal, galería de al menos 4 fotos, y una sección opcional de regalos.

## Alcance de esta primera versión

### Incluido

- Panel privado con acceso propio para el cliente
- Alta, edición y eliminación de invitaciones
- Generación automática de link único por invitación
- Botón de copiar link listo para compartir por WhatsApp
- Selector de plantilla: al menos 4 plantillas propias (parametrizadas por los datos del evento, no editor visual)
- Vista previa de la invitación con los datos capturados, antes de compartir el link real
- Captura de nombre de la quinceañera y de los padres
- Datos del evento: fecha, ceremonia religiosa, recepción, código de vestimenta, mapa
- Cronograma del evento (lista ordenada de momentos con hora, título e ícono)
- Cuenta regresiva hacia la fecha del evento
- Foto principal y galería de al menos 4 fotos
- Sección de regalos opcional (mensaje, datos bancarios en texto libre, link de mesa de regalos)
- Confirmación de asistencia por nombre de invitado, en un solo envío por invitación (no editable después)
- Fecha límite de respuesta visible en la invitación (informativa, sin automatizar vencimiento)
- Tablero de conteo: por invitación (respondida / sin responder) y total de personas confirmadas/declinadas
- Diseño responsivo, optimizado para celulares y conexiones débiles

### Fuera de esta versión

- Vencimiento automático o eliminación automática de invitaciones sin respuesta (se maneja manualmente por ahora)
- Envío automático o masivo por WhatsApp (API de Meta)
- Recordatorios automáticos programados
- Pases de acceso con código QR
- Acomodo de mesas
- Editor visual de plantillas (constructor drag-and-drop)
- Registro de padrinos por rubro con seguimiento de aportaciones
- Libro de deseos
- Soporte para más de un evento por cuenta (multi-evento)

## Herramientas y stack técnico

Elegido para que una sola persona pueda construir y mantener el sistema con velocidad, sin sacrificar una base de datos sólida para crecer después.

`Next.js (App Router)` · `PostgreSQL` · `Prisma ORM` · `Tailwind CSS` · `shadcn/ui` · `NextAuth / Auth.js` · `UploadThing / S3` · `Vercel (hosting)` · `wa.me (envío manual por WhatsApp)`

| Herramienta | Uso en el proyecto |
|---|---|
| Next.js | Panel privado y página pública de invitación; renderizado rápido en servidor |
| PostgreSQL + Prisma | Base de datos de eventos, invitaciones, plantillas y confirmaciones; esquema tipado |
| Tailwind + shadcn/ui | Interfaz del panel: tabla, formularios y estados, simple y presentable |
| NextAuth / Auth.js | Acceso privado del cliente al panel de administración |
| UploadThing / S3 | Almacenamiento de foto principal y galería, con optimización al subir |
| Vercel | Despliegue sin gestión de servidores mientras se valida el producto |
| wa.me | Compartir cada link de invitación por WhatsApp de forma manual |

## Cronograma de referencia

Ventana disponible: envío de invitaciones una semana antes de inicios de noviembre, según la costumbre regional de mandar con un mes de anticipación.

| Etapa | Entregable |
|---|---|
| 1 | Esquema de base de datos: evento, invitación, personas, RSVP |
| 2 | Acceso privado + panel con alta, edición y borrado de invitaciones |
| 3 | Plantilla pública de invitación con datos del evento y RSVP |
| 4 | Tablero de conteo de confirmaciones |
| 5 | Pruebas con el cliente usando el panel y datos reales |
| 6 | Margen para ajustes antes del envío real de invitaciones |

---

## Visión a futuro (fuera del alcance actual)

Más allá de este primer evento, el proyecto está pensado para evolucionar hacia un producto propio de invitaciones digitales, siguiendo esta ruta:

- **Fase B2C**: producto abierto para familias que organizan XV años, con plan gratuito limitado y planes de pago por evento.
- **Diferenciadores propios**: registro de padrinos por rubro, galería post-evento colaborativa, pases QR para control de acceso.
- **Fase B2B**: una vez validado el uso recurrente, adaptación para salones de eventos y organizadores profesionales, con marca propia por cliente y manejo de múltiples eventos.
- **Expansión de vertical**: incorporar bodas reutilizando el motor genérico (RSVP, invitaciones, panel) y agregando solo el esquema de datos específico de boda.

Estas funciones no se construyen en esta primera versión; se documentan aquí para que las decisiones técnicas actuales (modelo de datos separado por dominio, organización desde el inicio, marca configurable) no bloqueen este camino más adelante.

---
*Documento de alcance — plataforma de invitaciones digitales, vertical XV años.*
