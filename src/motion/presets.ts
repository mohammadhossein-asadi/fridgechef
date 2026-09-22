"use client";

import { useEffect, useState } from "react";
import { SPRINGS } from "./transitions";

/** whileHover / whileTap presets (Motion components) */
export const hoverLift = {
  whileHover: { y: -6, scale: 1.015, transition: SPRINGS.gentle },
  whileTap: { scale: 0.985 },
};

export const hoverGrow = {
  whileHover: { scale: 1.03, transition: SPRINGS.snappy },
  whileTap: { scale: 0.97 },
};

/** Respect prefers-reduced-motion across the app */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Coarse pointer (touch) detection — disables cursor effects on mobile */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return touch;
}

/** Rough device tier for 3D quality decisions */
export function useDeviceTier(): "low" | "medium" | "high" {
  const [tier, setTier] = useState<"low" | "medium" | "high">("high");
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
    if (coarse && (cores <= 4 || mem <= 4)) setTier("low");
    else if (coarse || cores <= 4) setTier("medium");
    else setTier("high");
  }, []);
  return tier;
}
