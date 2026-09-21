import { EleganteEucalipto } from "@/components/templates/elegante-eucalipto";
import { eventoDemo, invitacionDemo } from "@/data/evento-mock";

export default function PaginaInvitacionDemo() {
  return (
    <EleganteEucalipto
      evento={eventoDemo}
      invitacion={invitacionDemo}
      demostracion
    />
  );
}