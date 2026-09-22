"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Stylized low-poly ingredient models — procedural geometry only,
 * no external assets. Each is a few primitives with flat shading.
 */

interface ModelProps {
  scale?: number;
}

const MAT_OPTS = { flatShading: true };

export function Tomato3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color="#e23f31" roughness={0.35} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.08, 6]} />
        <meshStandardMaterial color="#456221" {...MAT_OPTS} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.46, 0]} rotation={[0, (i * Math.PI) / 3, 0.5]}>
          <boxGeometry args={[0.22, 0.02, 0.07]} />
          <meshStandardMaterial color="#567d27" {...MAT_OPTS} />
        </mesh>
      ))}
    </group>
  );
}

export function Onion3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.45, 10, 8]} />
        <meshStandardMaterial color="#d9a06b" roughness={0.5} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, 0.42, 0]} rotation={[0.2, 0, 0.15]}>
        <coneGeometry args={[0.07, 0.3, 5]} />
        <meshStandardMaterial color="#8db94f" {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[-0.15, 1.2, -0.2]}>
        <coneGeometry args={[0.06, 0.26, 5]} />
        <meshStandardMaterial color="#6f9d35" {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Egg3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale} rotation={[0, 0, 0.35]}>
      <mesh castShadow scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial color="#f6ead2" roughness={0.45} {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Lemon3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale} rotation={[0, 0, 0.6]}>
      <mesh castShadow scale={[1.35, 0.95, 0.95]}>
        <sphereGeometry args={[0.34, 10, 8]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.4} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0.42, 0, 0]}>
        <sphereGeometry args={[0.07, 6, 5]} />
        <meshStandardMaterial color="#e8b323" {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Carrot3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale} rotation={[0.4, 0, 2.4]}>
      <mesh castShadow position={[0, -0.1, 0]}>
        <coneGeometry args={[0.2, 0.85, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.45} {...MAT_OPTS} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.4, 0]} rotation={[0, (i * Math.PI) / 1.5, 0.4]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshStandardMaterial color="#567d27" {...MAT_OPTS} />
        </mesh>
      ))}
    </group>
  );
}

export function Pepper3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale}>
      <mesh castShadow scale={[1, 1.15, 1]}>
        <sphereGeometry args={[0.38, 10, 8]} />
        <meshStandardMaterial color="#e5484d" roughness={0.35} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, -0.3, 0]} scale={[0.8, 0.4, 0.8]}>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color="#c92a1e" roughness={0.4} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.14, 6]} />
        <meshStandardMaterial color="#456221" {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Herb3D({ scale = 1 }: ModelProps) {
  const leafs = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        rot: (i / 7) * Math.PI * 2,
        tilt: 0.5 + (i % 3) * 0.2,
        h: 0.3 + (i % 4) * 0.08,
      })),
    [],
  );
  return (
    <group scale={scale}>
      {leafs.map((l, i) => (
        <mesh key={i} position={[0, l.h / 2, 0]} rotation={[l.tilt, l.rot, 0]}>
          <boxGeometry args={[0.05, l.h, 0.03]} />
          <meshStandardMaterial color={i % 2 ? "#567d27" : "#6f9d35"} {...MAT_OPTS} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 7]} />
        <meshStandardMaterial color="#7a3715" {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Potato3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale} rotation={[0.3, 0.4, 0.2]}>
      <mesh castShadow scale={[1.25, 0.9, 0.85]}>
        <sphereGeometry args={[0.38, 9, 7]} />
        <meshStandardMaterial color="#c8a15f" roughness={0.7} {...MAT_OPTS} />
      </mesh>
      {[
        [-0.15, 0.1, 0.3],
        [0.2, -0.05, 0.28],
        [0.05, 0.18, -0.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.035, 5, 4]} />
          <meshStandardMaterial color="#8a6a35" {...MAT_OPTS} />
        </mesh>
      ))}
    </group>
  );
}

export function RiceBowl3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale}>
      {/* bowl */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 12, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45]} />
        <meshStandardMaterial color="#2e7d6b" roughness={0.3} side={THREE.DoubleSide} {...MAT_OPTS} />
      </mesh>
      {/* rice mound */}
      <mesh position={[0, 0.12, 0]} scale={[1.02, 0.55, 1.02]}>
        <sphereGeometry args={[0.42, 10, 8]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.8} {...MAT_OPTS} />
      </mesh>
      {/* saffron rice top */}
      <mesh position={[0.1, 0.3, 0.05]} scale={[0.4, 0.2, 0.4]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#ffbf4d" roughness={0.75} {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Chicken3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale} rotation={[0, 0, -0.7]}>
      <mesh castShadow scale={[1, 0.85, 0.85]}>
        <sphereGeometry args={[0.3, 9, 7]} />
        <meshStandardMaterial color="#d99a4e" roughness={0.5} {...MAT_OPTS} />
      </mesh>
      <mesh position={[-0.3, 0.08, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.05, 0.08, 0.3, 7]} />
        <meshStandardMaterial color="#e8b877" roughness={0.5} {...MAT_OPTS} />
      </mesh>
      <mesh position={[-0.48, 0.2, 0]}>
        <sphereGeometry args={[0.09, 7, 6]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.6} {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Pomegranate3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale}>
      <mesh castShadow scale={[1, 0.92, 1]}>
        <sphereGeometry args={[0.45, 10, 8]} />
        <meshStandardMaterial color="#a82015" roughness={0.4} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.08, 6]} />
        <meshStandardMaterial color="#731c16" {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

export function Garlic3D({ scale = 1 }: ModelProps) {
  return (
    <group scale={scale}>
      <mesh castShadow scale={[0.9, 1, 0.9]}>
        <sphereGeometry args={[0.32, 9, 7]} />
        <meshStandardMaterial color="#f3ecdc" roughness={0.55} {...MAT_OPTS} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0.1, 0, 0.2]}>
        <coneGeometry args={[0.06, 0.22, 5]} />
        <meshStandardMaterial color="#d8cfb8" {...MAT_OPTS} />
      </mesh>
    </group>
  );
}

/** id → component registry */
export const INGREDIENT_MODEL_MAP: Record<string, React.FC<ModelProps>> = {
  tomato: Tomato3D,
  onion: Onion3D,
  egg: Egg3D,
  lemon: Lemon3D,
  carrot: Carrot3D,
  bell_pepper: Pepper3D,
  herbs: Herb3D,
  potato: Potato3D,
  rice: RiceBowl3D,
  chicken: Chicken3D,
  pomegranate: Pomegranate3D,
  garlic: Garlic3D,
};

/** Fallback model for ids without a dedicated mesh */
export function Generic3D({ scale = 1, color = "#aacc78" }: ModelProps & { color?: string }) {
  return (
    <mesh scale={scale} castShadow>
      <dodecahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial color={color} roughness={0.5} {...MAT_OPTS} />
    </mesh>
  );
}
