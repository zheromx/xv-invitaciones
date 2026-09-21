import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/panel/:path*"],
};