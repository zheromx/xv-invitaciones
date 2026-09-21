import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FormularioLogin } from "@/components/login/formulario-login";

export default async function LoginPage() {
  const sesion = await auth();
  if (sesion?.user) redirect("/panel");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-dorado">
          XV años — invitaciones
        </p>
        <p className="mt-2 font-serif text-3xl text-eucalipto-700">
          Panel del organizador
        </p>
      </div>
      <FormularioLogin />
    </div>
  );
}