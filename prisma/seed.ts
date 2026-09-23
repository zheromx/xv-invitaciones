import { PrismaClient, Plantilla } from "@prisma/client";
import { hashContrasena } from "../lib/hash";

const prisma = new PrismaClient();

const EMAIL_DESARROLLO = "desarrollo@invitaciones.local";
const PASSWORD_DESARROLLO = "cambiar-en-produccion-123";
const EMAIL_FALLBACK = "desarrollo-fallback@invitaciones.local";
const TOKEN_SIN_RESPONDER = "dev-familia-lopez-sin-responder-2026";
const TOKEN_RESPONDIDA = "dev-familia-martinez-respondida-2026";
const TOKEN_FALLBACK_MENSAJE = "dev-mensaje-fallback-2026";

const FECHA_EVENTO = new Date(2026, 10, 7, 19, 0, 0);
const FECHA_LIMITE_RSVP = new Date(2026, 9, 31, 23, 59, 0);
const FECHA_ENVIADA = new Date(2026, 9, 20, 12, 0, 0);
const FECHA_RESPUESTA = new Date(2026, 9, 18, 18, 30, 0);

function urlGaleria(n: number): string {
  return `https://placehold.co/800x1000/f5f3f0/264335?text=Galeria+${n}`;
}

const datosEvento = {
  plantilla: Plantilla.ELEGANTE_EUCALIPTO,
  nombreQuinceanera: "Valentina (desarrollo)",
  nombrePadre: "Jorge",
  nombreMadre: "Ana María",
  nombrePadrinos: "Padrinos de desarrollo",
  mensajePadres: "Con todo nuestro amor, Jorge y Ana María.",
  fecha: FECHA_EVENTO,
  fechaLimiteRsvp: FECHA_LIMITE_RSVP,
  tieneMisa: true,
  misaLugar: "Parroquia de San Judas Tadeo",
  misaDireccion: "Av. de los Mirtos 120, Centro",
  misaHora: "18:00 HRS",
  recepcionLugar: "Jardín Eucalipto",
  recepcionDireccion: "Carretera al Lago km 4.5",
  recepcionHora: "20:00 HRS",
  codigoVestimenta: "Formal — trajes de gala",
  infoAdicional: "El estacionamiento es gratuito dentro del recinto.",
  fotoPrincipalUrl:
    "https://placehold.co/800x1000/264335/fbf9f6?text=XV+Desarrollo",
};

const cronograma = [
  { hora: "18:00 HRS", titulo: "Ceremonia religiosa", icono: "church" },
  { hora: "20:00 HRS", titulo: "Recepción y coctel de bienvenida", icono: "sparkles" },
  { hora: "21:00 HRS", titulo: "Cena", icono: "cena" },
  { hora: "22:30 HRS", titulo: "El vals", icono: "musica" },
  { hora: "23:30 HRS", titulo: "Pista abierta", icono: "fiesta" },
];

async function sincronizarPersonas(
  invitacionId: string,
  personas: { nombre: string; asiste: boolean | null }[],
) {
  await prisma.persona.deleteMany({ where: { invitacionId } });
  await prisma.persona.createMany({
    data: personas.map((persona) => ({ ...persona, invitacionId })),
  });
}

async function main() {
  const passwordHash = await hashContrasena(PASSWORD_DESARROLLO);

  const usuario = await prisma.usuario.upsert({
    where: { email: EMAIL_DESARROLLO },
    update: {
      nombre: "Desarrollo — usuario temporal",
      password: passwordHash,
    },
    create: {
      email: EMAIL_DESARROLLO,
      password: passwordHash,
      nombre: "Desarrollo — usuario temporal",
    },
  });

  const eventoExistente = await prisma.evento.findFirst({
    where: { usuarioId: usuario.id },
  });

  const evento = eventoExistente
    ? await prisma.evento.update({
        where: { id: eventoExistente.id },
        data: datosEvento,
      })
    : await prisma.evento.create({
        data: { ...datosEvento, usuarioId: usuario.id },
      });

  await prisma.momentoEvento.deleteMany({ where: { eventoId: evento.id } });
  await prisma.momentoEvento.createMany({
    data: cronograma.map((momento, orden) => ({
      ...momento,
      orden,
      eventoId: evento.id,
    })),
  });

  await prisma.fotoGaleria.deleteMany({ where: { eventoId: evento.id } });
  await prisma.fotoGaleria.createMany({
    data: [1, 2, 3, 4].map((n) => ({
      url: urlGaleria(n),
      orden: n - 1,
      eventoId: evento.id,
    })),
  });

  const invitacionSinResponder = await prisma.invitacion.upsert({
    where: { token: TOKEN_SIN_RESPONDER },
    update: {
      titulo: "Familia López — prueba sin responder",
      eventoId: evento.id,
      respondida: false,
      respondidaEn: null,
      enviadaEn: FECHA_ENVIADA,
    },
    create: {
      titulo: "Familia López — prueba sin responder",
      token: TOKEN_SIN_RESPONDER,
      eventoId: evento.id,
      respondida: false,
      respondidaEn: null,
      enviadaEn: FECHA_ENVIADA,
    },
  });

  await sincronizarPersonas(invitacionSinResponder.id, [
    { nombre: "Ana López", asiste: null },
    { nombre: "Carlos López", asiste: null },
    { nombre: "Sofía López", asiste: null },
  ]);

  const invitacionRespondida = await prisma.invitacion.upsert({
    where: { token: TOKEN_RESPONDIDA },
    update: {
      titulo: "Familia Martínez — prueba respondida",
      eventoId: evento.id,
      respondida: true,
      respondidaEn: FECHA_RESPUESTA,
      enviadaEn: FECHA_ENVIADA,
    },
    create: {
      titulo: "Familia Martínez — prueba respondida",
      token: TOKEN_RESPONDIDA,
      eventoId: evento.id,
      respondida: true,
      respondidaEn: FECHA_RESPUESTA,
      enviadaEn: FECHA_ENVIADA,
    },
  });

  await sincronizarPersonas(invitacionRespondida.id, [
    { nombre: "María Martínez", asiste: true },
    { nombre: "José Martínez", asiste: true },
    { nombre: "Lucía Martínez", asiste: false },
  ]);

  // Segundo evento (usuario aparte) con mensajePadres=null para comprobar el
  // fallback EXACTO del bloque de padres de forma determinista.
  const usuarioFallback = await prisma.usuario.upsert({
    where: { email: EMAIL_FALLBACK },
    update: {
      nombre: "Desarrollo — fallback mensaje",
      password: passwordHash,
    },
    create: {
      email: EMAIL_FALLBACK,
      password: passwordHash,
      nombre: "Desarrollo — fallback mensaje",
    },
  });

  const eventoFallbackExistente = await prisma.evento.findFirst({
    where: { usuarioId: usuarioFallback.id },
  });

  const datosEventoFallback = {
    ...datosEvento,
    nombreQuinceanera: "Valentina (fallback)",
    mensajePadres: null,
  };

  const eventoFallback = eventoFallbackExistente
    ? await prisma.evento.update({
        where: { id: eventoFallbackExistente.id },
        data: datosEventoFallback,
      })
    : await prisma.evento.create({
        data: { ...datosEventoFallback, usuarioId: usuarioFallback.id },
      });

  await prisma.momentoEvento.deleteMany({ where: { eventoId: eventoFallback.id } });
  await prisma.momentoEvento.createMany({
    data: cronograma.map((momento, orden) => ({
      ...momento,
      orden,
      eventoId: eventoFallback.id,
    })),
  });

  await prisma.fotoGaleria.deleteMany({ where: { eventoId: eventoFallback.id } });
  await prisma.fotoGaleria.createMany({
    data: [1, 2, 3, 4].map((n) => ({
      url: urlGaleria(n),
      orden: n - 1,
      eventoId: eventoFallback.id,
    })),
  });

  const invitacionFallback = await prisma.invitacion.upsert({
    where: { token: TOKEN_FALLBACK_MENSAJE },
    update: {
      titulo: "Familia Fallback — mensaje nulo",
      eventoId: eventoFallback.id,
      respondida: false,
      respondidaEn: null,
      enviadaEn: FECHA_ENVIADA,
    },
    create: {
      titulo: "Familia Fallback — mensaje nulo",
      token: TOKEN_FALLBACK_MENSAJE,
      eventoId: eventoFallback.id,
      respondida: false,
      respondidaEn: null,
      enviadaEn: FECHA_ENVIADA,
    },
  });

  await sincronizarPersonas(invitacionFallback.id, [
    { nombre: "Persona Fallback", asiste: null },
  ]);

  console.log("Seed de desarrollo aplicado.");
  console.log(`Sin responder: /invitacion/${invitacionSinResponder.token}`);
  console.log(`Respondida:     /invitacion/${invitacionRespondida.token}`);
  console.log(`Fallback msg:   /invitacion/${invitacionFallback.token}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());