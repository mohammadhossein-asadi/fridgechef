"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useFridgeChef } from "@/lib/store";
import { formatToman, formatNumber, toPersianDigits, formatCompactToman } from "@/lib/format";
import { MealSlotLabels, MealSlot } from "@/lib/schemas";
import { IRANIAN_WEEK_DAYS, toJalali, JALALI_MONTHS, toFaDigits } from "@/lib/dates-helpers";
import { DEMO_RECIPE_MAP } from "@/lib/demo";
import { findIngredient } from "@/lib/ingredients";
import { staggerContainer } from "@/motion/variants";
import { MagneticButton } from "@/motion/MagneticButton";
import type { Recipe } from "@/lib/schemas";

const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];
const SLOT_ICONS: Record<MealSlot, string> = {
  breakfast: "🍳",
  lunch: "🍲",
  dinner: "🌙",
  snack: "🍎",
};

export default function PlanPage() {
  const plan = useFridgeChef((s) => s.plan);
  const mode = useFridgeChef((s) => s.planMeta?.mode ?? "demo");

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <motion.div
          className="mb-6 text-7xl"
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          aria-hidden
        >
          📅
        </motion.div>
        <h1 className="mb-3 font-display text-2xl font-black">هنوز برنامه‌ای نساخته‌ای</h1>
        <p className="mb-8 max-w-md text-charcoal-700">
          بودجه و تعداد نفراتت رو بگو تا برنامه هفتگی و لیست خریدت آماده کنیم.
        </p>
        <Link href="/planner">
          <MagneticButton className="rounded-2xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-8 py-4 font-extrabold text-white shadow-lg">
            شروع برنامه‌ریزی
          </MagneticButton>
        </Link>
      </div>
    );
  }

  const totals = plan.totals;
  const overBudget = totals.remainingToman < 0;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">برنامه هفتگی</h1>
          <p className="mt-1 text-sm text-charcoal-700">
            {toPersianDigits(plan.people)} نفره · بودجه {formatToman(plan.budgetToman)}
            {mode === "demo" && (
              <span className="mr-2 rounded-full bg-cream-200 px-2 py-0.5 text-xs font-bold">
                حالت نمایشی
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/shopping"
            className="rounded-xl border border-cream-300 bg-white px-5 py-3 text-sm font-extrabold transition-colors hover:bg-cream-100"
          >
            🛒 لیست خرید
          </Link>
          <Link
            href="/planner"
            className="rounded-xl bg-charcoal-800 px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
          >
            برنامه جدید
          </Link>
        </div>
      </div>

      {/* Budget summary cards */}
      <motion.div
        className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
      >
        <StatCard
          label="هزینه تقریبی کل"
          value={formatToman(totals.estimatedCostToman)}
          tone="neutral"
        />
        <StatCard
          label="باقی‌مانده بودجه"
          value={formatToman(Math.abs(totals.remainingToman))}
          tone={overBudget ? "danger" : "good"}
          suffix={overBudget ? "بیش از بودجه" : undefined}
        />
        <StatCard label="هزینه هر نفر" value={formatToman(totals.perPersonToman)} tone="neutral" />
        <StatCard label="هزینه روزانه" value={formatToman(totals.perDayToman)} tone="neutral" />
      </motion.div>

      {overBudget && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-pomegranate-50 px-4 py-3 text-sm font-bold text-pomegranate-700"
          role="alert"
        >
          هزینه تقریبی از بودجه شما بیشتر است — می‌توانید سطح بودجه را «اقتصادی» انتخاب کنید یا وعده‌های میان‌وعده را حذف کنید.
        </motion.p>
      )}

      {/* Days — Iranian week order */}
      <div className="flex flex-col gap-6">
        {plan.days.map((day, dayIdx) => {
          const date = new Date(day.date);
          const weekday = IRANIAN_WEEK_DAYS[(date.getDay() + 1) % 7];
          const j = toJalali(date);
          const dayRecipes = day.meals
            .map((m) => getRecipe(m.recipeId))
            .filter(Boolean) as Recipe[];

          return (
            <motion.section
              key={day.date}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: dayIdx * 0.04 }}
              className="glass rounded-3xl p-5 card-shadow md:p-6"
              aria-label={`برنامه ${weekday}`}
            >
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold">
                  {weekday}
                  <span className="mr-2 text-sm font-normal text-charcoal-700/70">
                    {toFaDigits(j.jd)} {JALALI_MONTHS[j.jm - 1]}
                  </span>
                </h2>
                <span className="text-xs font-bold text-charcoal-700/60">
                  {toPersianDigits(dayRecipes.reduce((s, r) => s + (r?.cookMinutes ?? 0) + (r?.prepMinutes ?? 0), 0))} دقیقه آشپزی
                </span>
              </header>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SLOT_ORDER.filter((slot) => day.meals.some((m) => m.slot === slot)).map(
                  (slot) => {
                    const meal = day.meals.find((m) => m.slot === slot)!;
                    const recipe = getRecipe(meal.recipeId);
                    if (!recipe) return null;
                    return (
                      <motion.div key={slot} layout>
                        <Link href={`/recipes/${recipe.id}`}>
                          <motion.article
                            layoutId={`recipe-card-${recipe.id}-${day.date}-${slot}`}
                            className="group h-full rounded-2xl border border-cream-200 bg-white/90 p-4 transition-shadow hover:card-shadow-lg"
                            whileHover={{ y: -4 }}
                            transition={{ type: "spring", stiffness: 280, damping: 22 }}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-2xl" aria-hidden>{recipe.emoji}</span>
                              <span className="text-[11px] font-bold text-charcoal-700/50">
                                {SLOT_ICONS[slot]} {MealSlotLabels[slot]}
                              </span>
                            </div>
                            <h3 className="mb-1 text-sm font-extrabold leading-6">{recipe.name}</h3>
                            <p className="text-[11px] leading-5 text-charcoal-700/60 line-clamp-2">
                              {recipe.description}
                            </p>
                            {meal.isLeftoverOf && (
                              <span className="mt-2 inline-block rounded-full bg-pistachio-100 px-2 py-0.5 text-[10px] font-bold text-pistachio-700">
                                استفاده از غذای باقی‌مانده
                              </span>
                            )}
                          </motion.article>
                        </Link>
                      </motion.div>
                    );
                  },
                )}
              </div>
            </motion.section>
          );
        })}
      </div>

      <div className="mt-10 text-center text-xs text-charcoal-700/50">
        هزینه‌ها «تقریبی» هستند و بر اساس میانگین قیمت‌ها محاسبه شده‌اند؛ ممکن است با بازار شهر شما تفاوت داشته باشند.
      </div>
    </div>
  );
}

function getRecipe(id: string): Recipe | undefined {
  return DEMO_RECIPE_MAP[id];
}

function StatCard({
  label,
  value,
  tone,
  suffix,
}: {
  label: string;
  value: string;
  tone: "good" | "danger" | "neutral";
  suffix?: string;
}) {
  const toneClass =
    tone === "good"
      ? "text-pistachio-600"
      : tone === "danger"
        ? "text-pomegranate-600"
        : "text-charcoal-900";
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      className="glass rounded-2xl p-5 card-shadow"
    >
      <p className="mb-1 text-xs font-bold text-charcoal-700/60">{label}</p>
      <p className={`text-xl font-black ${toneClass}`}>{value}</p>
      {suffix && <p className="mt-1 text-[11px] font-bold text-pomegranate-500">{suffix}</p>}
    </motion.div>
  );
}
