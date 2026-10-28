import { obtenerEventoSegunSesion } from "@/lib/invitaciones-panel";
import { prisma } from "@/lib/prisma";
import { urlPublicaInvitacion } from "@/lib/url-invitacion";
import { ListaInvitaciones, type FilaInvitacion } from "@/components/panel/lista-invitaciones";

export const dynamic = "force-dynamic";

const formatearFecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export default async function PaginaInvitaciones() {
  const evento = await obtenerEventoSegunSesion();
  if (evento) {
    const registros = await prisma.invitacion.findMany({
      where: { eventoId: evento.id },
      select: {
        id: true,
        titulo: true,
        telefono: true,
        token: true,
        respondida: true,
        respondidaEn: true,
        personas: { select: { id: true, nombre: true, asiste: true, mesa: true }, orderBy: { id: "asc" } },
      },
      orderBy: [{ creadaEn: "asc" },
                { titulo: "asc" }],
    });

    const filas: FilaInvitacion[] = await Promise.all(
      registros.map(async (registro) => {
        const confirmados = registro.personas.filter((p) => p.asiste === true);
        const confirmadas = confirmados.length;
        const asistentesSinMesa = confirmados.filter((p) => p.mesa === null).length;
        const urlBase = await urlPublicaInvitacion(registro.token);
        return {
          id: registro.id,
          titulo: registro.titulo,
          telefono: registro.telefono,
          url: urlBase,
          urlMesas: `${urlBase}/mesas`,
          respondida: registro.respondida,
          totalPersonas: registro.personas.length,
          confirmadas,
          asistentesSinMesa,
          integrantes: registro.personas.map((p) => p.nombre).join(", "),
          respondidaEn: registro.respondidaEn
            ? formatearFecha.format(registro.respondidaEn)
            : null,
        };
      })
    );

    return (
      <ListaInvitaciones
        invitaciones={filas}
        hayEvento={true}
        mensajeWhatsApp={evento.mensajeWhatsApp}
        mensajeRecordatorioWhatsApp={evento.mensajeRecordatorioWhatsApp}
        mensajeMesaWhatsApp={evento.mensajeMesaWhatsApp}
        fechaLimiteRsvpIso={evento.fechaLimiteRsvp?.toISOString() ?? null}
      />
    );
  }

  return (
    <ListaInvitaciones
      invitaciones={[]}
      hayEvento={false}
      mensajeWhatsApp={null}
      mensajeRecordatorioWhatsApp={null}
      mensajeMesaWhatsApp={null}
      fechaLimiteRsvpIso={null}
    />
  );
}
