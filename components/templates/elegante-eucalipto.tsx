import type { DatosEvento, InvitacionDemo } from "@/lib/evento";
import { AudioMusica } from "@/components/invitacion/audio-musica";
import { Bienvenida } from "@/components/invitacion/bienvenida";
import { Revelar } from "@/components/invitacion/revelar";
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
    <AudioMusica
      musicaUrl={evento.musicaUrl ?? null}
      esReal={!demostracion && Boolean(token)}
    >
      <div className="min-h-full bg-marfil">
      <Bienvenida evento={evento} />
      <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.xv-revelar,.xv-revelar-item{opacity:1!important;transform:none!important;translate:none!important}</style>",
          }}
      />
      <main
        id="invitacion"
        className="mx-auto flex w-full max-w-[420px] flex-col gap-5 bg-marfil pb-8"
      >
        <Revelar>
          <Portada evento={evento} />
        </Revelar>
        <Revelar>
          <MensajePadres evento={evento} />
        </Revelar>
        <Revelar>
          <CuentaRegresiva evento={evento} />
        </Revelar>
        <Rsvp
          evento={evento}
          invitacion={invitacion}
          demostracion={demostracion}
          token={token}
        />
        <Revelar>
          <DetallesEvento evento={evento} />
        </Revelar>
        <Cronograma evento={evento} />
        <Revelar>
          <Galeria evento={evento} />
        </Revelar>
        {evento.infoRegalos?.mostrar ? (
          <Revelar>
            <Regalos evento={evento} />
          </Revelar>
        ) : (
          <Regalos evento={evento} />
        )}
        <Revelar>
          <FooterBotanico evento={evento} />
        </Revelar>
      </main>
      </div>
    </AudioMusica>
  );
}