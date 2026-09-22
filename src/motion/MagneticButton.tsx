"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { SPRINGS } from "./transitions";
import { useReducedMotion, useIsTouch } from "./presets";

/**
 * Magnetic button — gently follows the pointer within its bounds.
 * Press has spring compression; disabled on touch & reduced-motion.
 */
export function MagneticButton({
  children,
  onClick,
  className = "",
  strength = 0.25,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRINGS.snappy);
  const sy = useSpring(y, SPRINGS.snappy);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduced || isTouch || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      x.set(dx * strength);
      y.set(dy * strength);
    },
    [x, y, strength, reduced, isTouch],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
