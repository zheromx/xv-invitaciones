import { createRouteHandler } from "uploadthing/next";
import { nuestroFileRouter } from "./core";

export const runtime = "nodejs";

export const { GET, POST } = createRouteHandler({ router: nuestroFileRouter });
