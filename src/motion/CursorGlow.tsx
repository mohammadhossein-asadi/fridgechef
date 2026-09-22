"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion, useIsTouch } from "./presets";

/** Subtle cursor-following glow — desktop only, never blocks interaction */
export function CursorGlow() {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });

  useEffect(() => {
    if (reduced || isTouch) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y, reduced, isTouch]);

  if (reduced || isTouch) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-40"
      style={{
        left: 0,
        top: 0,
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        width: 340,
        height: 340,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,167,38,0.10) 0%, rgba(255,167,38,0.04) 40%, transparent 70%)",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
