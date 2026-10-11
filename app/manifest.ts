import type { MetadataRoute } from "next";

// Web app manifest: tells phones (and the Android app wrapper) the app's
// name, icon, colours and how to open it. Next.js serves it at
// /manifest.webmanifest and links it in every page automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LightsNGo",
    short_name: "LightsNGo",
    description:
      "Find your people at every Grand Prix: race-day chat rooms, city guides written by fans who've been there, and private messages.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0E11",
    theme_color: "#0B0E11",
    categories: ["social", "sports", "travel"],
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
