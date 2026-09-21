import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "XV de Valentina | Invitación",
  description: "Te invitamos a celebrar los XV años de Valentina.",
};

export default function InvitacionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}