"use client";

import { useMemo } from "react";

const FALLBACK_EMOJI = [
  "🍅", "🧅", "🥔", "🥕", "🥚", "🍋", "🌿", "🍚", "🍗", "🫑", "🍆", "🍎",
];

/** Lightweight CSS-only ingredient field used when WebGL is unavailable. */
export default function IngredientField2DFallback({
  count = 14,
}: {
  count?: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        emoji: FALLBACK_EMOJI[i % FALLBACK_EMOJI.length],
        left: (i * 83) % 100,
        top: (i * 47) % 100,
        size: 22 + ((i * 13) % 22),
        delay: (i % 7) * 0.7,
        dur: 7 + (i % 5),
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            left: `${it.left}%`,
            top: `${it.top}%`,
            fontSize: it.size,
            animation: `float2d ${it.dur}s ease-in-out ${it.delay}s infinite alternate`,
          }}
        >
          {it.emoji}
        </span>
      ))}
      <style jsx global>{`
        @keyframes float2d {
          from {
            transform: translate3d(0, 0, 0) rotate(-4deg);
          }
          to {
            transform: translate3d(0, -18px, 0) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
