"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useFridgeChef } from "@/lib/store";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { MagneticButton } from "@/motion/MagneticButton";

export default function SavedPage() {
  const savedRecipes = useFridgeChef((s) => s.savedRecipes);

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-black">غذاهای ذخیره‌شده</h1>
      <p className="mb-8 text-charcoal-700">
        دستورهای مورد علاقه‌ات اینجا نگه داشته می‌شوند.
      </p>

      {savedRecipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl py-20 text-center"
        >
          <div className="mb-4 text-6xl" aria-hidden>🤍</div>
          <p className="mb-1 font-extrabold">هنوز چیزی ذخیره نکرده‌ای</p>
          <p className="mb-8 text-sm text-charcoal-700/60">
            با زدن قلب روی هر دستور پخت، اینجا ذخیره‌اش کن.
          </p>
          <Link href="/recipes">
            <MagneticButton className="rounded-2xl bg-charcoal-800 px-8 py-4 font-extrabold text-white shadow-lg">
              دیدن دستورها
            </MagneticButton>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedRecipes.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
