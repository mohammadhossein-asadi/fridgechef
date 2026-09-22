/**
 * Central motion design system.
 * Never hardcode random durations/easings in components.
 */
export const DURATIONS = {
  instant: 0.12,
  fast: 0.25,
  base: 0.45,
  slow: 0.8,
  cinematic: 1.4,
} as const;

/** RTL-aware easings */
export const EASINGS = {
  standard: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
};

export const SPRINGS = {
  gentle: { type: "spring", stiffness: 170, damping: 22 },
  snappy: { type: "spring", stiffness: 320, damping: 26 },
  bouncy: { type: "spring", stiffness: 420, damping: 17 },
  soft: { type: "spring", stiffness: 120, damping: 20 },
  config: { type: "spring", stiffness: 260, damping: 24 },
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  relaxed: 0.12,
  cinematic: 0.18,
} as const;
