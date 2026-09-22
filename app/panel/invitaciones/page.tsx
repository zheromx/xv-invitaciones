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
        token: true,
        respondida: true,
        respondidaEn: true,
        personas: { select: { id: true, nombre: true, asiste: true }, orderBy: { id: "asc" } },
      },
      orderBy: { creadaEn: "desc" },
    });

    const filas: FilaInvitacion[] = await Promise.all(
      registros.map(async (registro) => {
        const confirmadas = registro.personas.filter((p) => p.asiste === true).length;
        return {
          id: registro.id,
          titulo: registro.titulo,
          url: await urlPublicaInvitacion(registro.token),
          respondida: registro.respondida,
          totalPersonas: registro.personas.length,
          confirmadas,
          integrantes: registro.personas.map((p) => p.nombre).join(", "),
          respondidaEn: registro.respondidaEn
            ? formatearFecha.format(registro.respondidaEn)
            : null,
        };
      })
    );

    return <ListaInvitaciones invitaciones={filas} hayEvento={true} />;
  }

  return <ListaInvitaciones invitaciones={[]} hayEvento={false} />;
}