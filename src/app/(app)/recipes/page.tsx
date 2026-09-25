"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useSofreh } from "@/lib/store";
import { DEMO_RECIPES } from "@/lib/demo";
import { MealSlotLabels, MealSlot } from "@/lib/schemas";
import { normalizeFa } from "@/lib/schemas";

const FILTERS: { key: MealSlot | "all"; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "breakfast", label: "صبحانه" },
  { key: "lunch", label: "ناهار" },
  { key: "dinner", label: "شام" },
];

export default function RecipesPage() {
  const savedRecipes = useSofreh((s) => s.savedRecipes);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MealSlot | "all">("all");

  const all = useMemo(() => {
    const seen = new Set<string>();
    const merged: typeof DEMO_RECIPES = [];
    for (const r of [...DEMO_RECIPES, ...savedRecipes]) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        merged.push(r);
      }
    }
    return merged;
  }, [savedRecipes]);

  const filtered = useMemo(() => {
    const q = normalizeFa(query);
    return all.filter((r) => {
      const matchFilter = filter === "all" || r.mealTypes.includes(filter);
      const matchQuery =
        !q ||
        normalizeFa(r.name).includes(q) ||
        normalizeFa(r.description).includes(q) ||
        r.tags.some((t) => normalizeFa(t).includes(q));
      return matchFilter && matchQuery;
    });
  }, [all, query, filter]);

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-black">دستورهای پخت</h1>
      <p className="mb-8 text-charcoal-700">
        غذاهای خانگی ایرانی با هزینه تقریبی و مواد قابل تنظیم.
      </p>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی غذا..."
          className="min-w-56 flex-1 rounded-2xl border border-cream-300 bg-white px-5 py-3 text-sm outline-none transition-colors focus:border-saffron-400"
          aria-label="جستجوی دستور پخت"
        />
        <div className="flex gap-1.5" role="tablist" aria-label="فیلتر وعده">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`relative rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                filter === f.key ? "text-white" : "text-charcoal-700 hover:bg-cream-100"
              }`}
              role="tab"
              aria-selected={filter === f.key}
            >
              {filter === f.key && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-xl bg-charcoal-800"
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl py-20 text-center"
        >
          <div className="mb-4 text-5xl" aria-hidden>🔍</div>
          <p className="font-extrabold">چیزی پیدا نشد</p>
          <p className="mt-1 text-sm text-charcoal-700/60">
            عبارت دیگری را امتحان کنید یا فیلتر را تغییر دهید.
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
