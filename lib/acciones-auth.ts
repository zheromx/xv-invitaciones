"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type EstadoLogin = {
  error?: string;
};

export async function iniciarSesion(
  _estado: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/panel",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/login" });
}