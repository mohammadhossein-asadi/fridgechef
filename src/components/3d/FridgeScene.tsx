"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Group } from "three";
import {
  INGREDIENT_MODEL_MAP,
  Generic3D,
} from "./IngredientModels";
import { useDeviceTier, useReducedMotion } from "@/motion/presets";

export interface HeroIngredient {
  id: string;
  position: [number, number, number];
  scale: number;
  floatSpeed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
}

interface FridgeSceneProps {
  /** 0 = idle, 1 = fully collapsed into center bowl */
  progress?: number;
  pointer: { x: number; y: number };
}

const HERO_IDS = [
  "tomato", "onion", "egg", "lemon", "potato",
  "herbs", "chicken", "pomegranate", "rice", "garlic",
  "carrot", "bell_pepper", "eggplant", "cucumber",
];

function HeroIngredientMesh({
  ing,
  pointer,
  progress,
  reduced,
}: {
  ing: HeroIngredient;
  pointer: { x: number; y: number };
  progress: number;
  reduced: boolean;
}) {
  const group = useRef<Group>(null);
  const Model = INGREDIENT_MODEL_MAP[ing.id] ?? (() => <Generic3D />);
  const reducedF = reduced ? 0 : 1;

  const target = useMemo(() => {
    // collapse target: near-center ring, slightly in front
    const angle = Math.atan2(ing.position[1], ing.position[0]);
    const radius = 0.9 + (ing.scale % 0.3);
    return new THREE.Vector3(
      Math.cos(angle) * radius * 0.55,
      Math.sin(angle) * radius * 0.35 - 0.2,
      0.6,
    );
  }, [ing.position, ing.scale]);

  const startPos = useMemo(() => new THREE.Vector3(...ing.position), [ing.position]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    // Floating (idle)
    const floatY = reduced
      ? 0
      : Math.sin(t * (ing.floatSpeed ?? 1) + ing.position[0]) *
        (ing.floatIntensity ?? 0.18);

    // Pointer parallax — objects subtly rotate toward cursor
    const rotY = pointer.x * 0.25 * reducedF;
    const rotX = pointer.y * 0.15 * reducedF;

    // Collapse progress with per-object stagger
    const local = THREE.MathUtils.clamp((progress - ing.scale * 0.08) / 0.75, 0, 1);
    const eased = local * local * (3 - 2 * local); // smoothstep

    const px = THREE.MathUtils.lerp(startPos.x + pointer.x * 0.35 * reducedF, target.x, eased);
    const py = THREE.MathUtils.lerp(startPos.y + floatY, target.y, eased);
    const pz = THREE.MathUtils.lerp(startPos.z, target.z, eased);

    group.current.position.set(px, py, pz);
    group.current.rotation.y = t * 0.3 * (ing.rotationIntensity ?? 1) * reducedF + rotY;
    group.current.rotation.x = rotX * 0.6;
    const s = THREE.MathUtils.lerp(ing.scale, ing.scale * 0.55, eased);
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group}>
      <Model scale={1} />
    </group>
  );
}

export default function FridgeScene({ progress = 0, pointer }: FridgeSceneProps) {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const count = tier === "high" ? HERO_IDS.length : tier === "medium" ? 10 : 7;

  const ingredients = useMemo<HeroIngredient[]>(() => {
    return HERO_IDS.slice(0, count).map((id, i) => {
      const golden = i / count;
      const angle = golden * Math.PI * 2 + 0.4;
      const radiusX = 4.6 - (i % 3) * 0.5;
      const radiusY = 2.4 - (i % 4) * 0.3;
      return {
        id,
        position: [
          Math.cos(angle) * radiusX,
          Math.sin(angle) * radiusY + 0.2,
          -1.2 + (i % 4) * 0.8,
        ] as [number, number, number],
        scale: 0.85 + (i % 4) * 0.12,
        floatSpeed: 0.7 + (i % 5) * 0.14,
        floatIntensity: 0.14 + (i % 3) * 0.05,
        rotationIntensity: 0.6 + (i % 3) * 0.3,
      };
    });
  }, [count]);

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={1.1} color="#fff4e0" />
      <directionalLight position={[-5, -2, -4]} intensity={0.25} color="#ffd88f" />
      <FridgeLighting tier={tier} />

      {ingredients.map((ing) => (
        <HeroIngredientMesh
          key={ing.id}
          ing={ing}
          pointer={pointer}
          progress={progress}
          reduced={reduced}
        />
      ))}

      {/* Central stylized bowl — appears during collapse */}
      <HeroBowl progress={progress} />

      <ContactShadows
        position={[0, -2.6, 0]}
        opacity={0.25}
        scale={12}
        blur={2.6}
        far={4}
        color="#7a3715"
      />
    </group>
  );
}

/** Soft studio lighting via Environment lightformers (no HDR download). */
function FridgeLighting({ tier }: { tier: "low" | "medium" | "high" }) {
  if (tier === "low") return null;
  return (
    <Environment resolution={64} frames={1}>
      <Lightformer
        intensity={0.9}
        color="#fff1d6"
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
      />
      <Lightformer
        intensity={0.5}
        color="#ffd88f"
        position={[-5, 1, -1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[8, 6, 1]}
      />
      <Lightformer
        intensity={0.4}
        color="#ffe8c2"
        position={[5, -1, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[8, 6, 1]}
      />
    </Environment>
  );
}

function HeroBowl({ progress }: { progress: number }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const p = Math.max(0, progress - 0.45) / 0.55;
    ref.current.scale.setScalar(Math.max(0.001, p));
    ref.current.rotation.y += 0.01 * p;
  });
  return (
    <group ref={ref} scale={0.001}>
      <RiceBowlInner />
    </group>
  );
}

function RiceBowlInner() {
  // A finished "meal" bowl: rice + toppings, gold rim
  return (
    <group position={[0, -0.3, 0]}>
      <mesh>
        <sphereGeometry args={[1.1, 14, 10, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48]} />
        <meshStandardMaterial color="#2e7d6b" roughness={0.25} side={THREE.DoubleSide} flatShading />
      </mesh>
      <mesh position={[0, 0.25, 0]} scale={[1.05, 0.5, 1.05]}>
        <sphereGeometry args={[0.95, 12, 9]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.25, 0.52, 0.1]} scale={[0.35, 0.22, 0.35]}>
        <sphereGeometry args={[0.5, 9, 7]} />
        <meshStandardMaterial color="#ffbf4d" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[-0.3, 0.5, -0.05]} scale={[0.28, 0.18, 0.28]}>
        <sphereGeometry args={[0.5, 9, 7]} />
        <meshStandardMaterial color="#e23f31" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0.05, 0.55, -0.25]} scale={[0.22, 0.15, 0.22]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color="#567d27" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}
