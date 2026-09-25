"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useSofreh } from "@/lib/store";
import { DEMO_RECIPE_MAP } from "@/lib/demo";
import { findIngredient } from "@/lib/ingredients";
import { formatCompactToman, toPersianDigits } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import { MoneyTip } from "@/components/MoneyTip";
import { MagneticButton } from "@/motion/MagneticButton";
import { Reveal } from "@/motion/Reveal";
import type { Recipe } from "@/lib/schemas";

const MealScene = dynamic(() => import("@/components/3d/MealScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-72 w-full place-items-center rounded-3xl bg-cream-100 md:h-96">
      <span className="text-sm text-charcoal-700/60">در حال بارگذاری نمای سه‌بعدی...</span>
    </div>
  ),
});

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const savedRecipes = useSofreh((s) => s.savedRecipes);
  const recipe: Recipe | undefined =
    DEMO_RECIPE_MAP[id] ?? savedRecipes.find((r) => r.id === id);

  const pantry = useSofreh((s) => s.pantry);
  const saved = useSofreh((s) => s.savedRecipes.some((r) => r.id === id));
  const saveRecipe = useSofreh((s) => s.saveRecipe);
  const unsaveRecipe = useSofreh((s) => s.unsaveRecipe);
  const [show3D, setShow3D] = useState(false);

  const { have, buy } = useMemo(() => {
    if (!recipe) return { have: [], buy: [] };
    const have = recipe.ingredients.filter(
      (line) => pantry.includes(line.id) || pantry.includes(`free:${line.name}`),
    );
    const buy = recipe.ingredients.filter(
      (line) => !pantry.includes(line.id) && !pantry.includes(`free:${line.name}`),
    );
    return { have, buy };
  }, [recipe, pantry]);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-6xl" aria-hidden>🥄</div>
        <h1 className="mb-2 text-2xl font-black">دستور پخت پیدا نشد</h1>
        <p className="mb-6 text-sm text-charcoal-700/70">
          ممکن است این دستور از برنامه فعلی حذف شده باشد.
        </p>
        <Link href="/recipes" className="rounded-xl bg-charcoal-800 px-6 py-3 text-sm font-extrabold text-white">
          بازگشت به دستورها
        </Link>
      </div>
    );
  }

  const totalTime = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <article>
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-charcoal-700 transition-colors hover:text-saffron-700"
      >
        <span aria-hidden>→</span> بازگشت به دستورها
      </Link>

      {/* Header — expands from card via layoutId on the emoji */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
        className="glass mb-8 rounded-3xl p-6 card-shadow md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <motion.span
              layoutId={`recipe-hero-${recipe.id}`}
              className="text-6xl md:text-7xl"
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              aria-hidden
            >
              {recipe.emoji}
            </motion.span>
            <div>
              <h1 className="font-display text-3xl font-black md:text-4xl">{recipe.name}</h1>
              <p className="mt-2 max-w-xl leading-7 text-charcoal-700">{recipe.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            onClick={() => (saved ? unsaveRecipe(recipe.id) : saveRecipe(recipe))}
            className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition-colors ${
              saved
                ? "bg-pomegranate-500 text-white"
                : "border border-cream-300 bg-white hover:bg-cream-100"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {saved ? "❤️ ذخیره شد" : "🤍 ذخیره دستور"}
          </motion.button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <InfoChip label="آماده‌سازی" value={`${toPersianDigits(recipe.prepMinutes)} دقیقه`} />
          <InfoChip label="پخت" value={`${toPersianDigits(recipe.cookMinutes)} دقیقه`} />
          <InfoChip label="نفرات" value={`${toPersianDigits(recipe.servings)} نفر`} />
          <InfoChip label="سختی" value={recipe.difficulty} />
        </dl>
      </motion.header>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Ingredients column */}
        <Reveal className="lg:col-span-2">
          <section className="glass rounded-3xl p-6 card-shadow" aria-label="مواد لازم">
            <h2 className="mb-4 text-lg font-extrabold">مواد لازم</h2>

            {have.length > 0 && (
              <>
                <h3 className="mb-2 text-xs font-bold text-pistachio-600">
                  ✓ در خانه دارید ({toPersianDigits(have.length)})
                </h3>
                <ul className="mb-5 flex flex-col gap-1.5">
                  {have.map((line) => (
                    <li
                      key={line.id}
                      className="flex items-center justify-between rounded-xl bg-pistachio-50 px-3 py-2 text-sm"
                    >
                      <span>{line.name}</span>
                      <span className="text-xs text-charcoal-700/60">
                        {formatQuantity(line.qty, line.unit)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mb-2 text-xs font-bold text-saffron-600">
              🛒 باید بخرید ({toPersianDigits(buy.length)})
            </h3>
            <ul className="flex flex-col gap-1.5">
              {buy.map((line) => (
                <li
                  key={line.id}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{findIngredient(line.id)?.emoji ?? "🥘"}</span>
                    {line.name}
                  </span>
                  <span className="text-xs text-charcoal-700/60">
                    {formatQuantity(line.qty, line.unit)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-4">
              <span className="text-sm font-bold">هزینه تقریبی</span>
              <span className="text-lg font-black text-pistachio-600">
                <MoneyTip
                  value={recipe.estimatedCostToman}
                  display={formatCompactToman(recipe.estimatedCostToman)}
                  toneClass="text-pistachio-600"
                />
              </span>
            </div>
            <p className="mt-1 text-left text-[10px] text-charcoal-700/50">
              قیمت تقریبی — ممکن است با بازار شما تفاوت داشته باشد
            </p>
          </section>
        </Reveal>

        {/* Steps column */}
        <Reveal className="lg:col-span-3" delay={0.1}>
          <section className="glass rounded-3xl p-6 card-shadow" aria-label="طرز تهیه">
            <h2 className="mb-5 text-lg font-extrabold">طرز تهیه</h2>
            <ol className="flex flex-col gap-4">
              {recipe.steps.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="flex gap-3"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-saffron-500 text-xs font-black text-white">
                    {toPersianDigits(i + 1)}
                  </span>
                  <p className="leading-7 text-charcoal-800">{step}</p>
                </motion.li>
              ))}
            </ol>

            {recipe.tips && (
              <div className="mt-6 rounded-2xl bg-saffron-50 p-4">
                <p className="text-sm font-bold text-saffron-800">💡 نکته آشپزی</p>
                <p className="mt-1 text-sm leading-6 text-saffron-900">{recipe.tips}</p>
              </div>
            )}

            {recipe.substitutions.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-bold">جایگزین‌های پیشنهادی</h3>
                <ul className="flex flex-col gap-1 text-sm text-charcoal-700">
                  {recipe.substitutions.map((sub) => (
                    <li key={sub} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cream-300" aria-hidden />
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </Reveal>
      </div>

      {/* Optional 3D dish */}
      <section className="mt-8">
        {!show3D ? (
          <button
            onClick={() => setShow3D(true)}
            className="glass flex w-full items-center justify-center gap-2 rounded-3xl py-6 text-sm font-extrabold text-charcoal-700 transition-colors hover:bg-cream-100"
          >
            <span aria-hidden>🍽️</span>
            نمایش سه‌بعدی غذا (اختیاری)
          </button>
        ) : (
          <div className="glass overflow-hidden rounded-3xl card-shadow">
            <MealScene ingredientIds={recipe.ingredients.map((i) => i.id)} />
          </div>
        )}
      </section>
    </article>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-3 py-2.5">
      <dt className="text-[11px] font-bold text-charcoal-700/60">{label}</dt>
      <dd className="text-sm font-black">{value}</dd>
    </div>
  );
}
