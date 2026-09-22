import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dominios remotos usados por las imágenes del evento: UploadThing
    // (utfs.io / *.ufs.sh) y los placeholders del seed de desarrollo.
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
