import type { NextConfig } from "next";
import { IMAGE_HOSTS } from "./src/lib/image-hosts";

const nextConfig: NextConfig = {
  images: {
    // Thumbnails vêm sempre da fonte original; nada é hospedado aqui.
    // A lista mora em src/lib/image-hosts.ts porque os componentes precisam
    // consultar exatamente a mesma coisa antes de renderizar.
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
