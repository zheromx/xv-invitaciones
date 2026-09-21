export default function InvitacionNoEncontrada() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-marfil px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-dorado">
        Invitación
      </p>
      <h1 className="mt-5 font-serif text-4xl font-medium text-eucalipto-800">
        Link no válido
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
        Esta invitación no existe o el enlace ya no es válido. Revisa el enlace
        que te compartieron.
      </p>
    </main>
  );
}