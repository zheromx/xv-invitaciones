import type { DatosEvento, InvitacionDemo } from "@/lib/evento";

export const eventoDemo: DatosEvento = {
  nombreQuinceanera: "Valentina",
  nombrePadre: "Jorge",
  nombreMadre: "Ana María",
  fecha: new Date(2026, 10, 7, 19, 0, 0),
  fechaLimiteRsvp: new Date(2026, 9, 31, 23, 59, 0),
  tieneMisa: true,
  misaLugar: "Parroquia de San Judas Tadeo",
  misaDireccion: "Av. de los Mirtos 120, Centro",
  misaHora: "18:00 HRS",
  recepcionLugar: "Jardín Eucalipto",
  recepcionDireccion: "Carretera al Lago km 4.5",
  recepcionHora: "20:00 HRS",
  codigoVestimenta: "Formal — trajes de gala",
  infoAdicional: "El estacionamiento es gratuito dentro del recinto.",
  cronograma: [
    { hora: "18:00 HRS", titulo: "Ceremonia religiosa", icono: "church", orden: 0 },
    { hora: "20:00 HRS", titulo: "Recepción y coctel de bienvenida", icono: "sparkles", orden: 1 },
    { hora: "21:00 HRS", titulo: "Cena", icono: "cena", orden: 2 },
    { hora: "22:30 HRS", titulo: "El vals", icono: "musica", orden: 3 },
    { hora: "23:30 HRS", titulo: "Pista abierta", icono: "fiesta", orden: 4 },
  ],
  galeria: [
    { url: null, orden: 0 },
    { url: null, orden: 1 },
    { url: null, orden: 2 },
    { url: null, orden: 3 },
  ],
};

export const invitacionDemo: InvitacionDemo = {
  titulo: "Familia García",
  respondida: false,
  personas: [
    { nombre: "María García", asiste: true },
    { nombre: "Jorge García", asiste: true },
    { nombre: "Laura García", asiste: false },
    { nombre: "Luis García", asiste: true },
  ],
};