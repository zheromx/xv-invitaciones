import { headers } from "next/headers";

export async function urlPublicaInvitacion(token: string): Promise<string> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (base) return `${base}/invitacion/${token}`;

  const h = await headers();
  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    h.get("host") ||
    "localhost:3000";
  return `${proto}://${host}/invitacion/${token}`;
}