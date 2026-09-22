"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useReducedMotion } from "@/motion/presets";
import IngredientField2DFallback from "./IngredientField2D";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });
const FridgeScene = dynamic(() => import("./FridgeScene"), { ssr: false });

/**
 * Cinematic hero: floating ingredients react to pointer;
 * clicking «شروع برنامه‌ریزی» collapses everything into the meal bowl,
 * then routes to the planner.
 */
export default function Hero3D({ onPlanning }: { onPlanning?: () => void }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [starting, setStarting] = useState(false);
  const raf = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPointer({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const start = () => {
    if (starting) return;
    setStarting(true);
    onPlanning?.();
    const duration = reduced ? 300 : 2100;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      // easeInOutCubic
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setProgress(eased);
      if (p < 1) requestAnimationFrame(tick);
      else router.push("/planner");
    };
    requestAnimationFrame(tick);
  };

  return (
    <div className="absolute inset-0">
      <SceneCanvas
        className="absolute inset-0"
        camera={{ position: [0, 0.4, 8], fov: 42 }}
        fallback={<IngredientField2DFallback />}
      >
        <FridgeScene progress={progress} pointer={reduced ? { x: 0, y: 0 } : pointer} />
      </SceneCanvas>

      {/* Cinematic zoom overlay during collapse */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: starting ? 1 : 0 }}
        transition={{ duration: reduced ? 0.2 : 1.6, ease: "easeIn" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: starting ? 1 : 0 }}
        transition={{ duration: 0.5, delay: reduced ? 0 : 1.5 }}
        style={{
          background:
            "radial-gradient(circle at 50% 55%, transparent 20%, rgba(253,248,242,0.9) 75%)",
        }}
      />
    </div>
  );
}
