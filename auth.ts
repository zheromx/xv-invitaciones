import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verificarContrasena } from "@/lib/hash";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credenciales) => {
        const email =
          typeof credenciales?.email === "string"
            ? credenciales.email.trim().toLowerCase()
            : "";
        const password =
          typeof credenciales?.password === "string" ? credenciales.password : "";

        if (!email || !password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });
        if (!usuario) return null;

        const contrasenaValida = await verificarContrasena(
          password,
          usuario.password
        );
        if (!contrasenaValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre ?? usuario.email,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}