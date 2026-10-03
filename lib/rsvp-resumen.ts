import type { PersonaDemo } from "@/lib/evento";

export type PersonaResumen = {
  id: string;
  nombre: string;
};

export type ResumenRsvp = {
  asisten: PersonaResumen[];
  noAsisten: PersonaResumen[];
};

// Deriva el resumen que se muestra en la revisión previa a partir de la MISMA
// selección que se envía a la Server Action (`personaIdsQueAsisten`), sin
// inventar ni reordenar. Una persona fuera de la invitación no aparece.
export function construirResumen(
  personas: PersonaDemo[],
  seleccion: ReadonlySet<string>
): ResumenRsvp {
  const asisten: PersonaResumen[] = [];
  const noAsisten: PersonaResumen[] = [];

  for (const persona of personas) {
    const entrada = { id: persona.id, nombre: persona.nombre };
    if (seleccion.has(persona.id)) asisten.push(entrada);
    else noAsisten.push(entrada);
  }

  return { asisten, noAsisten };
}
