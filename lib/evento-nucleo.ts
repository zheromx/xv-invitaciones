import type { Plantilla } from "@prisma/client";
import { prisma } from "./prisma";

export type MotivoEvento =
  | "no-encontrada"
  | "no-autorizado"
  | "datos-invalidos"
  | "fallo";

export type MomentoEntrada = {
  id?: string;
  hora: string;
  titulo: string;
  icono: string | null;
};

export type DatosEventoActualizables = {
  plantilla: Plantilla;
  nombreQuinceanera: string;
  nombrePadre: string | null;
  nombreMadre: string | null;
  nombrePadrinos: string | null;
  fecha: Date;
  fechaLimiteRsvp: Date | null;
  tieneMisa: boolean;
  misaLugar: string | null;
  misaDireccion: string | null;
  misaHora: string | null;
  recepcionLugar: string;
  recepcionDireccion: string;
  recepcionHora: string;
  codigoVestimenta: string | null;
  infoAdicional: string | null;
  momentos: MomentoEntrada[];
};

// Núcleo transaccional puro (testeable sin Next): recibe el usuarioId de la
// sesión y deriva el Evento autorizado dentro de la transacción. Nunca acepta
// un eventoId del cliente. Actualiza Evento + sincroniza MomentoEvento en una
// sola transacción (todo o nada).
export async function ejecutarActualizarEvento(
  usuarioId: string,
  datos: DatosEventoActualizables
): Promise<MotivoEvento | null> {
  try {
    await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true },
      });
      if (!evento) throw new Error("no-encontrada");

      const existentes = await tx.momentoEvento.findMany({
        where: { eventoId: evento.id },
        select: { id: true },
      });
      const idsPermitidos = new Set(existentes.map((momento) => momento.id));
      const idsEntrantes = datos.momentos
        .map((momento) => momento.id)
        .filter((id): id is string => Boolean(id));
      if (idsEntrantes.some((id) => !idsPermitidos.has(id))) {
        throw new Error("no-autorizado");
      }

      const tieneMisa = datos.tieneMisa;

      await tx.evento.update({
        where: { id: evento.id },
        data: {
          plantilla: datos.plantilla,
          nombreQuinceanera: datos.nombreQuinceanera,
          nombrePadre: datos.nombrePadre,
          nombreMadre: datos.nombreMadre,
          nombrePadrinos: datos.nombrePadrinos,
          fecha: datos.fecha,
          fechaLimiteRsvp: datos.fechaLimiteRsvp,
          tieneMisa,
          // Si la ceremonia está desactivada, los tres campos quedan null.
          misaLugar: tieneMisa ? datos.misaLugar : null,
          misaDireccion: tieneMisa ? datos.misaDireccion : null,
          misaHora: tieneMisa ? datos.misaHora : null,
          recepcionLugar: datos.recepcionLugar,
          recepcionDireccion: datos.recepcionDireccion,
          recepcionHora: datos.recepcionHora,
          codigoVestimenta: datos.codigoVestimenta,
          infoAdicional: datos.infoAdicional,
        },
      });

      const idsConservados = new Set(idsEntrantes);
      await tx.momentoEvento.deleteMany({
        where: { eventoId: evento.id, id: { notIn: [...idsConservados] } },
      });

      for (let indice = 0; indice < datos.momentos.length; indice++) {
        const momento = datos.momentos[indice];
        const contenido = {
          hora: momento.hora,
          titulo: momento.titulo,
          icono: momento.icono,
          orden: indice,
        };
        if (momento.id) {
          await tx.momentoEvento.update({
            where: { id: momento.id },
            data: contenido,
          });
        } else {
          await tx.momentoEvento.create({
            data: { ...contenido, eventoId: evento.id },
          });
        }
      }
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message === "no-encontrada") return "no-encontrada";
    if (error.message === "no-autorizado") return "no-autorizado";
    console.error("Error al actualizar evento:", error);
    return "fallo";
  }

  return null;
}
