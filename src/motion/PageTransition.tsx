"use client";

import { motion } from "motion/react";
import { pageTransition } from "./variants";
import { useReducedMotion } from "./presets";

/** Wrap page content for enter/exit transitions between routes */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const preset = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : pageTransition;

  return (
    <motion.div
      initial={preset.initial}
      animate={preset.animate}
      exit={preset.exit}
      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
