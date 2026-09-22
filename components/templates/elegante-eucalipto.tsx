import type { DatosEvento, InvitacionDemo } from "@/lib/evento";
import { Portada } from "@/components/invitacion/portada";
import { MensajePadres } from "@/components/invitacion/mensaje-padres";
import { DetallesEvento } from "@/components/invitacion/detalles-evento";
import { CuentaRegresiva } from "@/components/invitacion/cuenta-regresiva";
import { Cronograma } from "@/components/invitacion/cronograma";
import { Galeria } from "@/components/invitacion/galeria";
import { Regalos } from "@/components/invitacion/regalos";
import { Rsvp } from "@/components/invitacion/rsvp";
import { FooterBotanico } from "@/components/invitacion/footer-botanico";

export function EleganteEucalipto({
  evento,
  invitacion,
  demostracion = false,
  token,
}: {
  evento: DatosEvento;
  invitacion: InvitacionDemo;
  demostracion?: boolean;
  token?: string;
}) {
  return (
    <div className="min-h-full bg-marfil">
      <main className="mx-auto flex w-full max-w-[420px] flex-col gap-5 bg-marfil pb-8">
        <Portada evento={evento} />
        <MensajePadres evento={evento} />
        <DetallesEvento evento={evento} />
        <CuentaRegresiva evento={evento} />
        <Cronograma evento={evento} />
        <Galeria evento={evento} />
        <Regalos evento={evento} />
        <Rsvp
          evento={evento}
          invitacion={invitacion}
          demostracion={demostracion}
          token={token}
        />
        <FooterBotanico evento={evento} />
      </main>
    </div>
  );
}