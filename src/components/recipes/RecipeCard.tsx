"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { TiltCard, useTilt } from "@/motion/TiltCard";
import { useSofreh } from "@/lib/store";
import { formatCompactToman, toPersianDigits } from "@/lib/format";
import { SPRINGS } from "@/motion/transitions";
import { MoneyTip } from "@/components/MoneyTip";
import type { Recipe } from "@/lib/schemas";

export function RecipeCard({ recipe, index = 0 }: { recipe: Recipe; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-40px" });
  const { ref, handlers, style, layerX, layerY } = useTilt(5);
  const saved = useSofreh((s) => s.savedRecipes.some((r) => r.id === recipe.id));
  const saveRecipe = useSofreh((s) => s.saveRecipe);
  const unsaveRecipe = useSofreh((s) => s.unsaveRecipe);

  const totalTime = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.96 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0, 0, 0.2, 1] }}
    >
      <TiltCard
        className="group relative block h-full"
        role="article"
        ariaLabel={recipe.name}
      >
        <div ref={ref} {...handlers} style={style} className="h-full">
          <Link href={`/recipes/${recipe.id}`} className="block h-full">
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-cream-200 dark:border-[var(--border)] bg-white/90 dark:bg-[var(--card)] p-6 card-shadow transition-shadow group-hover:card-shadow-lg">
              {/* floating emoji layer (moves independently of the card) */}
              <motion.div
                className="mb-4 text-5xl"
                style={{ x: layerX, y: layerY }}
                aria-hidden
              >
                {recipe.emoji}
              </motion.div>

              <h3 className="mb-1.5 text-lg font-extrabold leading-7 text-charcoal-900 dark:text-[var(--foreground)]">
                {recipe.name}
              </h3>
              <p className="mb-4 line-clamp-2 flex-1 text-sm leading-6 text-charcoal-700/70 dark:text-[var(--muted)]">
                {recipe.description}
              </p>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-cream-100 dark:bg-[var(--card-2)] px-2.5 py-1 text-[11px] font-bold text-charcoal-700 dark:text-[var(--foreground)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-cream-100 dark:border-[var(--border)] pt-4 text-xs">
                <span className="font-bold text-charcoal-700/70 dark:text-[var(--muted)]">
                  ⏱ {toPersianDigits(totalTime)} دقیقه
                </span>
                <span className="flex flex-col items-end">
                  <span className="font-black text-pistachio-600 dark:text-pistachio-300">
                    <MoneyTip
                      value={recipe.estimatedCostToman}
                      display={formatCompactToman(recipe.estimatedCostToman)}
                      toneClass="text-pistachio-600 dark:text-pistachio-300"
                    />
                  </span>
                  <span className="text-[10px] text-charcoal-700/50 dark:text-[var(--muted)]">هزینه تقریبی</span>
                </span>
              </div>

              {/* CTA becomes prominent on hover */}
              <span className="pointer-events-none mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-saffron-600 dark:text-saffron-300 opacity-0 transition-all duration-200 group-hover:opacity-100">
                دیدن دستور پخت
                <span aria-hidden>←</span>
              </span>
            </article>
          </Link>

          {/* save heart */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              if (saved) {
                unsaveRecipe(recipe.id);
              } else {
                saveRecipe(recipe);
              }
            }}
            className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 dark:bg-[var(--card)] shadow-md backdrop-blur"
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.12 }}
            aria-label={saved ? `حذف ${recipe.name} از ذخیره‌شده‌ها` : `ذخیره ${recipe.name}`}
            aria-pressed={saved}
          >
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={saved ? "#e23f31" : "none"}
              stroke="#3d3929"
              className="dark:stroke-[#ece7da]"
              strokeWidth="2"
              animate={saved ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              aria-hidden
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </motion.svg>
          </motion.button>
        </div>
      </TiltCard>
    </motion.div>
  );
}
