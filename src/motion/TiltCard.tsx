"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion, useIsTouch } from "./presets";

/**
 * Tactile 3D tilt card. Subtle by design:
 * - ±6° max tilt, perspective 900px
 * - exposes layer transforms for inner parallax
 */
export function useTilt(maxTilt = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 24 });
  const sy = useSpring(py, { stiffness: 220, damping: 24 });

  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useTransform(sx === sy ? sx : sy, [0, 1], [maxTilt, -maxTilt]);
  const layerX = useTransform(sx, [0, 1], [-8, 8]);
  const layerY = useTransform(sy, [0, 1], [-6, 6]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduced || isTouch || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width);
      py.set((e.clientY - rect.top) / rect.height);
    },
    [px, py, reduced, isTouch],
  );

  const onPointerLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  const enable = !reduced && !isTouch;
  const style = enable
    ? {
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d" as const,
      }
    : {};

  return {
    ref,
    handlers: { onPointerMove, onPointerLeave },
    style,
    layerX,
    layerY,
    enabled: enable,
  };
}

export function TiltCard({
  children,
  className,
  maxTilt = 6,
  onClick,
  role,
  ariaLabel,
  tabIndex,
  onKeyDown,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const { ref, handlers, style } = useTilt(maxTilt);
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      {...handlers}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      {children}
    </motion.div>
  );
}

/** Child layer that floats slightly above the card surface (pass layerX/layerY) */
export function TiltLayer({
  children,
  className,
  x,
  y,
}: {
  children: React.ReactNode;
  className?: string;
  x?: MotionValue<number>;
  y?: MotionValue<number>;
}) {
  return (
    <motion.div className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
