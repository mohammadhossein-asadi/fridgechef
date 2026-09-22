"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import { INGREDIENT_MODEL_MAP, Generic3D } from "./IngredientModels";
import { ingredientFa, ingredientEmoji } from "@/lib/ingredients";
import { useDeviceTier, useReducedMotion } from "@/motion/presets";

function DishIngredient({
  id,
  angle,
  radius,
  onHover,
}: {
  id: string;
  angle: number;
  radius: number;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const Model = INGREDIENT_MODEL_MAP[id] ?? (() => <Generic3D />);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = 0.1 + Math.sin(t * 1.2 + angle) * 0.06;
    ref.current.rotation.y = t * 0.4;
  });

  return (
    <group
      ref={ref}
      position={[Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]}
      scale={hovered ? 0.85 : 0.7}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(id);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      <Model />
      {hovered && (
        <Html center distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-charcoal-900/90 px-3 py-1 text-xs text-cream-50">
            {ingredientEmoji(id)} {ingredientFa(id)}
          </div>
        </Html>
      )}
    </group>
  );
}

function Bowl({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = clock.elapsedTime * 0.15;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1.3, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
        <meshStandardMaterial color="#2e7d6b" roughness={0.25} side={THREE.DoubleSide} flatShading />
      </mesh>
      <mesh position={[0, 0.28, 0]} scale={[1.08, 0.5, 1.08]}>
        <sphereGeometry args={[1.1, 14, 10]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.3, 0.5, 0.15]} scale={[0.4, 0.24, 0.4]}>
        <sphereGeometry args={[0.6, 10, 8]} />
        <meshStandardMaterial color="#ffbf4d" roughness={0.75} flatShading />
      </mesh>
      <mesh position={[-0.35, 0.5, -0.1]} scale={[0.32, 0.2, 0.32]}>
        <sphereGeometry args={[0.6, 10, 8]} />
        <meshStandardMaterial color="#e23f31" roughness={0.65} flatShading />
      </mesh>
      <mesh position={[0, 0.55, -0.3]} scale={[0.26, 0.17, 0.26]}>
        <sphereGeometry args={[0.6, 9, 7]} />
        <meshStandardMaterial color="#567d27" roughness={0.65} flatShading />
      </mesh>
    </group>
  );
}

/** Lazy-loaded 3D dish for recipe detail pages. */
export default function MealScene({ ingredientIds }: { ingredientIds: string[] }) {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  const ids = useMemo(() => {
    const known = ingredientIds.filter((id) => INGREDIENT_MODEL_MAP[id] || id);
    return known.slice(0, tier === "high" ? 6 : 4);
  }, [ingredientIds, tier]);

  return (
    <div className="relative h-72 w-full md:h-96" role="img" aria-label="نمای سه‌بعدی غذا">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2.6, 5], fov: 40 }} gl={{ alpha: true, antialias: tier === "high" }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 3]} intensity={1} color="#fff4e0" />
        <group position={[0, -0.6, 0]}>
          <Bowl reduced={reduced} />
          {ids.map((id, i) => (
            <DishIngredient
              key={`${id}-${i}`}
              id={id}
              angle={(i / ids.length) * Math.PI * 2}
              radius={1.9}
              onHover={setHovered}
            />
          ))}
        </group>
        <ContactShadows position={[0, -1.2, 0]} opacity={0.3} scale={8} blur={2.4} far={3} color="#7a3715" />
        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={7}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          enableZoom
          rotateSpeed={0.6}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-2 right-2 text-xs text-charcoal-700/70">
        {hovered ? (
          <span className="glass rounded-full px-3 py-1">
            {ingredientEmoji(hovered)} {ingredientFa(hovered)}
          </span>
        ) : (
          "بچرخانید و روی مواد نگه دارید"
        )}
      </div>
    </div>
  );
}
