"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useFridgeChef } from "@/lib/store";
import { formatToman, toPersianDigits, formatNumber } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import { findIngredient } from "@/lib/ingredients";
import { MagneticButton } from "@/motion/MagneticButton";
import type { ShoppingCategory } from "@/lib/schemas";

const CATEGORY_META: Record<ShoppingCategory, { label: string; icon: string }> = {
  produce: { label: "میوه و سبزیجات", icon: "🥬" },
  protein: { label: "گوشت و پروتئین", icon: "🍗" },
  dairy: { label: "لبنیات", icon: "🧀" },
  legumes: { label: "حبوبات و خشکبار", icon: "🫘" },
  grains: { label: "مواد غذایی خشک", icon: "🍚" },
  spices: { label: "ادویه و چاشنی", icon: "🧂" },
  other: { label: "سایر", icon: "🛍️" },
};

const CATEGORY_ORDER: ShoppingCategory[] = [
  "produce", "protein", "dairy", "legumes", "grains", "spices", "other",
];

export default function ShoppingPage() {
  const plan = useFridgeChef((s) => s.plan);
  const checked = useFridgeChef((s) => s.shoppingChecked);
  const toggle = useFridgeChef((s) => s.toggleShoppingItem);

  const grouped = useMemo(() => {
    if (!plan) return [];
    const map = new Map<ShoppingCategory, typeof plan.shopping>();
    for (const item of plan.shopping) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [plan]);

  if (!plan || plan.shopping.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <motion.div
          className="mb-6 text-7xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          aria-hidden
        >
          🛒
        </motion.div>
        <h1 className="mb-3 font-display text-2xl font-black">لیست خرید خالی است</h1>
        <p className="mb-8 max-w-md text-charcoal-700">
          بعد از ساخت برنامه هفتگی، لیست خرید بهینه به‌طور خودکار ساخته می‌شود.
        </p>
        <Link href="/planner">
          <MagneticButton className="rounded-2xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-8 py-4 font-extrabold text-white shadow-lg">
            ساخت برنامه هفتگی
          </MagneticButton>
        </Link>
      </div>
    );
  }

  const items = plan.shopping;
  const checkedCount = items.filter((i) => checked[i.id]).length;
  const checkedTotal = items
    .filter((i) => checked[i.id])
    .reduce((s, i) => s + i.estimatedPriceToman, 0);
  const grandTotal = items.reduce((s, i) => s + i.estimatedPriceToman, 0);
  const progress = items.length ? checkedCount / items.length : 0;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">لیست خرید هفتگی</h1>
          <p className="mt-1 text-sm text-charcoal-700">
            {toPersianDigits(items.length)} قلم · مرتب‌شده بر اساس دسته‌بندی فروشگاه
          </p>
        </div>
        <Link
          href="/plan"
          className="rounded-xl border border-cream-300 bg-white px-5 py-3 text-sm font-extrabold transition-colors hover:bg-cream-100"
        >
          📅 مشاهده برنامه هفتگی
        </Link>
      </div>

      {/* Progress (RTL) */}
      <div className="glass mb-8 rounded-3xl p-6 card-shadow">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-extrabold">
            {toPersianDigits(checkedCount)} از {toPersianDigits(items.length)} قلم برداشته شد
          </span>
          <span className="font-black text-pistachio-600">
            {formatToman(grandTotal - checkedTotal)} باقی‌مانده
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-cream-200"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="پیشرفت خرید"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-pistachio-400 to-pistachio-600"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs text-charcoal-700/60">
          <span>جمع کل تقریبی: {formatToman(grandTotal)}</span>
          <span>بودجه هفته: {formatToman(plan.budgetToman)}</span>
        </div>
      </div>

      {/* Category groups */}
      <div className="flex flex-col gap-8">
        {grouped.map(({ category, items: catItems }) => (            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            aria-label={CATEGORY_META[category].label}
          >
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream-100" aria-hidden>
                {CATEGORY_META[category].icon}
              </span>
              {CATEGORY_META[category].label}
              <span className="text-xs font-bold text-charcoal-700/50">
                ({toPersianDigits(catItems.length)} قلم)
              </span>
            </h2>

            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false}>
                {catItems.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    >
                      <motion.button
                        onClick={() => toggle(item.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-right transition-colors ${
                          isChecked
                            ? "border-pistachio-200 bg-pistachio-50"
                            : "border-cream-200 bg-white hover:border-cream-300 hover:card-shadow"
                        }`}
                        whileTap={{ scale: 0.98 }}
                        aria-pressed={isChecked}
                      >
                        <span className="flex items-center gap-3">
                          {/* animated checkbox */}
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
                              isChecked
                                ? "border-pistachio-500 bg-pistachio-500 text-white"
                                : "border-cream-300 bg-white text-transparent"
                            }`}
                            aria-hidden
                          >
                            <motion.svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              initial={false}
                              animate={{ scale: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 28 }}
                            >
                              <path d="M4 12l6 6L20 6" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          </span>
                          <span>
                            <motion.span
                              className="block text-sm font-bold text-charcoal-900"
                              animate={{
                                opacity: isChecked ? 0.45 : 1,
                              }}
                            >
                              <motion.span
                                className="relative inline-block"
                              >
                                {item.name}
                                <motion.span
                                  className="absolute right-0 top-1/2 h-0.5 bg-charcoal-700"
                                  style={{ left: 0, originX: 1 }}
                                  animate={{ scaleX: isChecked ? 1 : 0 }}
                                  transition={{ duration: 0.25 }}
                                  aria-hidden
                                />
                              </motion.span>
                            </motion.span>
                            <motion.span
                              className="block text-xs text-charcoal-700/60"
                              animate={{ opacity: isChecked ? 0.4 : 1 }}
                            >
                              {formatQuantity(item.qty, item.unit)}
                            </motion.span>
                          </span>
                        </span>
                        <span className="text-xs font-bold text-charcoal-700/70">
                          {formatToman(item.estimatedPriceToman)}
                        </span>
                      </motion.button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </motion.section>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-charcoal-700/50">
        قیمت‌ها «تقریبی» هستند و بر اساس میانگین کشوری محاسبه شده‌اند — نه قیمت لحظه‌ای بازار.
      </p>
    </div>
  );
}
