export type ValorPlantilla =
  | "ELEGANTE_EUCALIPTO"
  | "CLASICA_DORADA"
  | "PASTEL_ROMANTICA"
  | "MODERNA_MINIMAL";

export type OpcionPlantilla = {
  valor: ValorPlantilla;
  nombre: string;
  estilo: string;
  descripcion: string;
  disponible: boolean;
};

// Selector limitado: solo ELEGANTE_EUCALIPTO está implementada. Las demás se
// muestran como "Próximamente", deshabilitadas y sin alterar el valor guardado.
export const PLANTILLAS: OpcionPlantilla[] = [
  {
    valor: "ELEGANTE_EUCALIPTO",
    nombre: "Elegante Eucalipto",
    estilo: "Estilo botánico editorial",
    descripcion:
      "Verde salvia, marfil y dorado mate. Tipografía editorial y detalle botánico de alta gama.",
    disponible: true,
  },
  {
    valor: "CLASICA_DORADA",
    nombre: "Clásica Dorada",
    estilo: "Atemporal y solemne",
    descripcion:
      "Dorado champagne, marfil y negro suave para celebraciones tradicionales.",
    disponible: false,
  },
  {
    valor: "PASTEL_ROMANTICA",
    nombre: "Pastel Romántica",
    estilo: "Delicada y primaveral",
    descripcion:
      "Rosa blush, lavanda suave y blanco perla con acentos tenues y fotografía amplia.",
    disponible: false,
  },
  {
    valor: "MODERNA_MINIMAL",
    nombre: "Moderna Minimal",
    estilo: "Suiza y vanguardista",
    descripcion:
      "Monocromático cálido, alta jerarquía tipográfica y composición sobria contemporánea.",
    disponible: false,
  },
];

export const PLANTILLA_PREDETERMINADA: ValorPlantilla = "ELEGANTE_EUCALIPTO";

export function esPlantillaDisponible(valor: string): boolean {
  return PLANTILLAS.some((opcion) => opcion.valor === valor && opcion.disponible);
}
