import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.name,
    short_name: "AMORÉTTO AI",
    description: `${APP_CONFIG.moduleName}・${APP_CONFIG.stage}`,
    start_url: "/",
    display: "standalone",
    background_color: "#F8F3EA",
    theme_color: "#14213D",
    lang: "ja",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
