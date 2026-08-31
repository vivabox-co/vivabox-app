import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vivabox",
    short_name: "Vivabox",
    description: "Activa tu código Vivabox y reserva tu experiencia",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#152F40",
    lang: "es",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
