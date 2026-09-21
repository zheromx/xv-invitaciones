import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-marfil px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-dorado">
        Invitaciones digitales
      </p>
      <h1 className="mt-5 font-serif text-5xl font-medium text-eucalipto-800">
        XV Años
      </h1>
      <p className="mt-5 max-w-md text-sm leading-7 text-zinc-600">
        Crea, comparte y confirma tus invitaciones de XV años en un solo lugar:
        invitación, confirmación de asistencia y conteo de invitados.
      </p>
      <Link
        href="/invitacion/demo"
        className="mt-9 inline-flex items-center justify-center rounded-full bg-eucalipto-600 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-eucalipto-700"
      >
        Ver invitación de demostración
      </Link>
    </main>
  );
}