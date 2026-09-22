"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SPRINGS } from "@/motion/transitions";

const ICONS = {
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
} as const;

// Resolve the *displayed* icon (light/dark only). "system" defaults to the
// sun icon on the server and first paint; next-themes updates it on mount.
const displayIcon = (t: "light" | "dark" | "system" | undefined): "light" | "dark" =>
  t === "dark" ? "dark" : "light";

// On the server and first paint the resolved icon is unknown; show a neutral
// placeholder to avoid a hydration flash, then settle on the real icon.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const resolved = mounted ? displayIcon(theme as "light" | "dark" | "system" | undefined) : "light";
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="grid h-10 w-10 place-items-center rounded-lg text-charcoal-700 transition-colors hover:bg-cream-100 dark:text-cream-200 dark:hover:bg-white/10"
      aria-label={`تغییر به حالت ${next === "dark" ? "شب" : "روز"}`}
      title={`تغییر به حالت ${next === "dark" ? "شب" : "روز"}`}
    >
      <motion.span
        key={resolved}
        initial={{ opacity: 0, rotate: -30 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={SPRINGS.snappy}
        className="grid h-6 w-6 place-items-center"
      >
        {ICONS[resolved]}
      </motion.span>
    </button>
  );
}
