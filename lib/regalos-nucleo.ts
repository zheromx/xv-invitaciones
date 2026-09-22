import { prisma } from "./prisma";

export type MotivoRegalos =
  | "no-encontrada"
  | "no-autorizado"
  | "datos-invalidos"
  | "fallo";

export type MesaEntrada = {
  id?: string;
  tienda: string;
  url: string;
};

export type DatosRegalosActualizables = {
  mostrar: boolean;
  mensaje: string | null;
  datosBancarios: string | null;
  numeroEvento: string | null;
  mesas: MesaEntrada[];
};

// Núcleo transaccional puro (testeable sin Next): recibe el usuarioId de la
// sesión y deriva el Evento autorizado dentro de la transacción. Hace upsert de
// InfoRegalos y sincroniza MesaRegalo (crea/edita/elimina) conservando los
// datos al ocultar (`mostrar=false`) y persistiendo el orden secuencial.
export async function ejecutarActualizarRegalos(
  usuarioId: string,
  datos: DatosRegalosActualizables
): Promise<MotivoRegalos | null> {
  try {
    await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true },
      });
      if (!evento) throw new Error("no-encontrada");

      const info = await tx.infoRegalos.upsert({
        where: { eventoId: evento.id },
        update: {
          mostrar: datos.mostrar,
          mensaje: datos.mensaje,
          datosBancarios: datos.datosBancarios,
          numeroEvento: datos.numeroEvento,
        },
        create: {
          eventoId: evento.id,
          mostrar: datos.mostrar,
          mensaje: datos.mensaje,
          datosBancarios: datos.datosBancarios,
          numeroEvento: datos.numeroEvento,
        },
        select: { id: true },
      });

      const existentes = await tx.mesaRegalo.findMany({
        where: { infoRegalosId: info.id },
        select: { id: true },
      });
      const idsPermitidos = new Set(existentes.map((mesa) => mesa.id));
      const idsEntrantes = datos.mesas
        .map((mesa) => mesa.id)
        .filter((id): id is string => Boolean(id));
      if (idsEntrantes.some((id) => !idsPermitidos.has(id))) {
        throw new Error("no-autorizado");
      }

      const idsConservados = new Set(idsEntrantes);
      await tx.mesaRegalo.deleteMany({
        where: { infoRegalosId: info.id, id: { notIn: [...idsConservados] } },
      });

      for (let indice = 0; indice < datos.mesas.length; indice++) {
        const mesa = datos.mesas[indice];
        const contenido = { tienda: mesa.tienda, url: mesa.url, orden: indice };
        if (mesa.id) {
          await tx.mesaRegalo.update({
            where: { id: mesa.id },
            data: contenido,
          });
        } else {
          await tx.mesaRegalo.create({
            data: { ...contenido, infoRegalosId: info.id },
          });
        }
      }
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message === "no-encontrada") return "no-encontrada";
    if (error.message === "no-autorizado") return "no-autorizado";
    console.error("Error al actualizar regalos:", error);
    return "fallo";
  }

  return null;
}
