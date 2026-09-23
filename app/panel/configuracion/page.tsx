import { Eye } from "lucide-react";
import {
  obtenerEventoConfiguracionSesion,
  obtenerImagenesEventoSesion,
  obtenerRegalosEventoSesion,
} from "@/lib/evento-panel";
import {
  FormularioEvento,
  type ValoresInicialesEvento,
} from "@/components/panel/formulario-evento";
import { BloqueImagenes } from "@/components/panel/imagenes-evento";
import { BloqueRegalos } from "@/components/panel/regalos-evento";

export const dynamic = "force-dynamic";

function dosDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

function aDatetimeLocal(fecha: Date | null): string {
  if (!fecha) return "";
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(
    fecha.getDate()
  )}T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

function aFechaDia(fecha: Date | null): string {
  if (!fecha) return "";
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(
    fecha.getDate()
  )}`;
}

export default async function PaginaConfiguracionEvento() {
  const evento = await obtenerEventoConfiguracionSesion();
  const imagenes = evento ? await obtenerImagenesEventoSesion() : null;
  const regalos = evento ? await obtenerRegalosEventoSesion() : null;
  if (!evento) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl text-eucalipto-700">
            Configuración del evento
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Datos base, sedes, protocolo, cronograma y plantilla.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-serif text-lg text-eucalipto-700">
            Aún no hay evento vinculado
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            En desarrollo, ejecuta el seed para crear el evento y las
            invitaciones de prueba.
          </p>
        </div>
      </div>
    );
  }

  const inicial: ValoresInicialesEvento = {
    nombreQuinceanera: evento.nombreQuinceanera,
    nombrePadre: evento.nombrePadre ?? "",
    nombreMadre: evento.nombreMadre ?? "",
    nombrePadrinos: evento.nombrePadrinos ?? "",
    mensajePadres: evento.mensajePadres ?? "",
    fecha: aDatetimeLocal(evento.fecha),
    fechaLimiteRsvp: aFechaDia(evento.fechaLimiteRsvp),
    tieneMisa: evento.tieneMisa,
    misaLugar: evento.misaLugar ?? "",
    misaDireccion: evento.misaDireccion ?? "",
    misaHora: evento.misaHora ?? "",
    misaMapaUrl: evento.misaMapaUrl ?? "",
    recepcionLugar: evento.recepcionLugar,
    recepcionDireccion: evento.recepcionDireccion,
    recepcionHora: evento.recepcionHora,
    recepcionMapaUrl: evento.recepcionMapaUrl ?? "",
    codigoVestimenta: evento.codigoVestimenta ?? "",
    infoAdicional: evento.infoAdicional ?? "",
    plantilla: evento.plantilla,
    momentos: evento.cronograma.map((momento) => ({
      id: momento.id,
      hora: momento.hora,
      titulo: momento.titulo,
      icono: momento.icono ?? "",
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-eucalipto-700">
            Configuración del evento
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Administra los datos que verán los invitados en la invitación
            digital.
          </p>
        </div>
        <a
          href="/panel/configuracion/vista-previa"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
        >
          <Eye className="h-4 w-4" />
          Vista previa
        </a>
      </div>

      <FormularioEvento inicial={inicial} />

      <BloqueImagenes
        principalUrl={imagenes?.fotoPrincipalUrl ?? null}
        misaFotoUrl={imagenes?.misaFotoUrl ?? null}
        recepcionFotoUrl={imagenes?.recepcionFotoUrl ?? null}
        tieneMisa={evento.tieneMisa}
        galeria={imagenes?.fotosGaleria ?? []}
      />

      <BloqueRegalos
        inicial={{
          mostrar: regalos?.mostrar ?? false,
          mensaje: regalos?.mensaje ?? "",
          datosBancarios: regalos?.datosBancarios ?? "",
          numeroEvento: regalos?.numeroEvento ?? "",
          mesas:
            regalos?.mesasRegalo.map((mesa) => ({
              id: mesa.id,
              tienda: mesa.tienda,
              url: mesa.url,
            })) ?? [],
        }}
      />
    </div>
  );
}
