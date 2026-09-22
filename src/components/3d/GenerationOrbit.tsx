"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useDeviceTier, useReducedMotion } from "@/motion/presets";
import { INGREDIENT_MODEL_MAP, Generic3D } from "./IngredientModels";
import { ingredientEmoji, ingredientFa } from "@/lib/ingredients";

export interface GenerationPhase {
  label: string;
  duration: number; // ms
}

export const GENERATION_PHASES: GenerationPhase[] = [
  { label: "در حال بررسی بودجه...", duration: 1400 },
  { label: "در حال انتخاب غذاها...", duration: 1800 },
  { label: "در حال بررسی مواد موجود...", duration: 1500 },
  { label: "در حال بهینه‌سازی هزینه...", duration: 1700 },
  { label: "در حال ساخت لیست خرید...", duration: 1400 },
  { label: "برنامه هفتگی شما آماده است", duration: 1200 },
];

function OrbitingIngredient({
  id,
  radius,
  speed,
  phase,
  angle0,
}: {
  id: string;
  radius: number;
  speed: number;
  phase: number; // 0..1 formation progress
  angle0: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const Model = INGREDIENT_MODEL_MAP[id] ?? (() => <Generic3D />);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const a = angle0 + t * speed;
    const r = radius * (0.4 + 0.6 * phase);
    ref.current.position.set(Math.cos(a) * r, Math.sin(a * 0.6) * 0.3 * phase, Math.sin(a) * r);
    ref.current.rotation.y = t * 0.5;
  });

  return (
    <group ref={ref} scale={0.001 + phase * 0.55}>
      <Model />
    </group>
  );
}

function GlowCore({ phase }: { phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const s = 0.55 + Math.sin(t * 2.2) * 0.05 + phase * 0.25;
    ref.current.scale.setScalar(s);
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#ffbf4d"
          emissive="#f98a1d"
          emissiveIntensity={0.9}
          roughness={0.25}
          flatShading
        />
      </mesh>
      <pointLight intensity={2.2} distance={9} color="#ffbf4d" />
    </group>
  );
}

function Connections({ phase }: { phase: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const N = 8;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2;
      const a1 = ((i + 2) / N) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(Math.cos(a0) * 2, 0, Math.sin(a0) * 2),
        new THREE.Vector3(Math.cos(a1) * 2, 0, Math.sin(a1) * 2),
      );
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return g;
  }, []);
  return (
    <lineSegments geometry={geo} visible={phase > 0.35}>
      <lineBasicMaterial color="#e7cba2" transparent opacity={0.35 * phase} />
    </lineSegments>
  );
}

/**
 * Immersive AI generation scene (no spinner!).
 * Shows orbital analysis of the user's ingredients with Persian phase labels.
 */
export default function GenerationOrbit({
  ingredientIds,
  active = true,
  onDone,
  totalDuration = GENERATION_PHASES.reduce((s, p) => s + p.duration, 0),
}: {
  ingredientIds: string[];
  active?: boolean;
  onDone?: () => void;
  totalDuration?: number;
}) {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [formation, setFormation] = useState(0);

  const ids = useMemo(() => {
    const base = ingredientIds.length
      ? ingredientIds
      : ["tomato", "onion", "egg", "rice", "herbs", "chicken", "lemon", "potato"];
    return base.slice(0, tier === "high" ? 9 : tier === "medium" ? 7 : 5);
  }, [ingredientIds, tier]);

  // Phase timeline
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let elapsed = 0;
    let timer: ReturnType<typeof setTimeout>;
    const run = (idx: number) => {
      if (cancelled || idx >= GENERATION_PHASES.length) {
        if (!cancelled) onDone?.();
        return;
      }
      setPhaseIdx(idx);
      timer = setTimeout(() => {
        elapsed += GENERATION_PHASES[idx].duration;
        run(idx + 1);
      }, GENERATION_PHASES[idx].duration);
    };
    run(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, onDone]);

  // Formation progress over the first 60% of the total duration
  useEffect(() => {
    if (!active) return;
    const dur = totalDuration * 0.6;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setFormation(reduced ? 1 : p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, totalDuration, reduced]);

  const phase = GENERATION_PHASES[Math.min(phaseIdx, GENERATION_PHASES.length - 1)];
  const isFinal = phaseIdx === GENERATION_PHASES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/90 backdrop-blur-md">
      {/* 3D orbit */}
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 2.2, 7], fov: 42 }}
          gl={{ antialias: tier === "high", alpha: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={0.9} />
          <GlowCore phase={formation} />
          <Connections phase={formation} />
          {ids.map((id, i) => (
            <OrbitingIngredient
              key={id}
              id={id}
              radius={2.4}
              speed={0.35 + (i % 3) * 0.08}
              angle0={(i / ids.length) * Math.PI * 2}
              phase={formation}
            />
          ))}
        </Canvas>
      </div>

      {/* Persian phase labels + ingredient chips */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-6 text-center">
        <motion.div
          key={phaseIdx}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`text-2xl font-bold md:text-3xl ${isFinal ? "text-pistachio-600" : "text-charcoal-800"}`}
        >
          {phase.label}
        </motion.div>

        <div className="flex max-w-md flex-wrap justify-center gap-2">
          {ids.map((id) => (
            <span
              key={id}
              className="glass rounded-full px-3 py-1 text-sm text-charcoal-700"
            >
              {ingredientEmoji(id)} {ingredientFa(id)}
            </span>
          ))}
        </div>

        {/* RTL progress bar */}
        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-gradient-to-l from-saffron-400 to-pomegranate-400 transition-all duration-500"
            style={{
              width: `${((phaseIdx + 1) / GENERATION_PHASES.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
