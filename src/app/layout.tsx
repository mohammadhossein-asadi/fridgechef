import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CursorGlow } from "@/motion/CursorGlow";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "سفره — برنامه‌ریز هوشمند غذای هفتگی",
    template: "%s | سفره",
  },
  description:
    "بودجه‌ات رو بگو، تعداد نفرات رو مشخص کن؛ برنامه غذایی هفته‌ات و لیست خرید بهینه رو بساز. کمتر بخر، کمتر دور بریز.",
  applicationName: "Sofreh",
  icons: [{ url: "/icon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  themeColor: "#f98a1d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-saffron-500 focus:px-4 focus:py-2 focus:text-white"
        >
          رفتن به محتوای اصلی
        </a>
        <CursorGlow />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="sofreh-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
