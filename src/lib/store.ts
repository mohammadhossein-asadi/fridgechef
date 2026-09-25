"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  PlannerRequest,
  Recipe,
  WeeklyPlan,
  ShoppingItem,
} from "./schemas";

interface Prefs {
  liked: string[];
  disliked: string[];
  allergies: string[];
  region: string | null;
  tier: "اقتصادی" | "متعادل" | "منعطف";
  city: string | null;
  currency: "toman" | "rial";
}

interface SofrehState {
  pantry: string[]; // ingredient ids
  prefs: Prefs;
  plan: WeeklyPlan | null;
  planMeta: { mode: "ai" | "demo" } | null;
  savedRecipes: Recipe[];
  shoppingChecked: Record<string, boolean>;

  addPantry: (id: string) => void;
  removePantry: (id: string) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setPlan: (plan: WeeklyPlan, mode: "ai" | "demo") => void;
  clearPlan: () => void;
  toggleShoppingItem: (id: string) => void;
  setShoppingChecked: (map: Record<string, boolean>) => void;
  saveRecipe: (recipe: Recipe) => void;
  unsaveRecipe: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useSofreh = create<SofrehState>()(
  persist(
    (set, get) => ({
      pantry: [],
      prefs: {
        liked: [],
        disliked: [],
        allergies: [],
        region: null,
        tier: "متعادل",
        city: null,
        currency: "toman",
      },
      plan: null,
      planMeta: null,
      savedRecipes: [],
      shoppingChecked: {},

      addPantry: (id) =>
        set((s) =>
          s.pantry.includes(id) ? s : { pantry: [...s.pantry, id] },
        ),
      removePantry: (id) =>
        set((s) => ({ pantry: s.pantry.filter((p) => p !== id) })),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      setPlan: (plan, mode) =>
        set({ plan, planMeta: { mode }, shoppingChecked: {} }),
      clearPlan: () => set({ plan: null, planMeta: null, shoppingChecked: {} }),
      toggleShoppingItem: (id) =>
        set((s) => ({
          shoppingChecked: { ...s.shoppingChecked, [id]: !s.shoppingChecked[id] },
        })),
      setShoppingChecked: (map) => set({ shoppingChecked: map }),
      saveRecipe: (recipe) =>
        set((s) =>
          s.savedRecipes.some((r) => r.id === recipe.id)
            ? s
            : { savedRecipes: [recipe, ...s.savedRecipes].slice(0, 50) },
        ),
      unsaveRecipe: (id) =>
        set((s) => ({
          savedRecipes: s.savedRecipes.filter((r) => r.id !== id),
        })),
      isSaved: (id) => get().savedRecipes.some((r) => r.id === id),
    }),
    {
      name: "sofreh-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // hydration flag exposed via hook below
      partialize: (s) => ({
        pantry: s.pantry,
        prefs: s.prefs,
        plan: s.plan,
        planMeta: s.planMeta,
        savedRecipes: s.savedRecipes,
        shoppingChecked: s.shoppingChecked,
      }),
    },
  ),
);

/** Prefs → PlannerRequest partial (used by planner page) */
export function plannerRequestFrom(
  pantry: string[],
  prefs: Prefs,
  budgetToman: number,
  people: number,
  days: number,
  slots: PlannerRequest["slots"],
  requestedMode: PlannerRequest["requestedMode"] = null,
): PlannerRequest {
  return {
    budgetToman,
    people,
    days,
    slots,
    pantry,
    liked: prefs.liked,
    disliked: prefs.disliked,
    allergies: prefs.allergies,
    region: prefs.region,
    tier: prefs.tier,
    city: prefs.city,
    requestedMode,
  };
}
