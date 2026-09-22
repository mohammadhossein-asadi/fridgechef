"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDeviceTier, useReducedMotion } from "@/motion/presets";
import IngredientField2DFallback from "./IngredientField2D";

const LazyCanvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false },
);

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Lazy WebGL Canvas with graceful 2D fallback when:
 * - WebGL is unavailable
 * - device is low tier (renders a lightweight CSS scene instead)
 * Reduced-motion only softens what is rendered inside (children responsibility).
 */
export default function SceneCanvas({
  children,
  className,
  camera,
  dpr,
  fallback,
}: {
  children: React.ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
  dpr?: [number, number];
  fallback?: React.ReactNode;
}) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const tier = useDeviceTier();
  const reduced = useReducedMotion();

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  const use3D = webgl === true && tier !== "low";

  return (
    <div className={className}>
      {!use3D ? (
        fallback ?? <IngredientField2DFallback />
      ) : (
        <LazyCanvas
          dpr={dpr ?? (tier === "medium" ? [1, 1.25] : [1, 1.75])}
          gl={{
            antialias: tier === "high",
            alpha: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: camera?.position ?? [0, 0, 8], fov: camera?.fov ?? 40 }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </LazyCanvas>
      )}
    </div>
  );
}
