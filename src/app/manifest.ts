import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سفره — برنامه‌ریز هوشمند غذای هفتگی",
    short_name: "سفره",
    description:
      "برنامه‌ریز هفتگی غذا، لیست خرید و دستورهای پخت — حتی بدون اینترنت در صف فروشگاه",
    dir: "rtl",
    lang: "fa",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#f98a1d",
    background_color: "#fdf8f2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
