"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { IngredientField } from "@/components/ingredients/IngredientField";
import { MagneticButton } from "@/motion/MagneticButton";

const GenerationOrbit = dynamic(
  () => import("@/components/3d/GenerationOrbit"),
  { ssr: false },
);
import { useFridgeChef, plannerRequestFrom } from "@/lib/store";
import { parsePersianNumber, formatToman, toPersianDigits } from "@/lib/format";
import { MealSlot, MealSlotLabels } from "@/lib/schemas";
import { REGIONS, CITIES } from "@/lib/ingredients";
import { SPRINGS } from "@/motion/transitions";
import { isAiConfigured } from "@/lib/ai/provider";
import type { WeeklyPlan } from "@/lib/schemas";

const STEPS = ["مواد غذایی من", "بودجه و نفرات", "وعده‌ها", "ترجیحات"] as const;

const SLOT_OPTIONS: { key: MealSlot; icon: string; hint: string }[] = [
  { key: "breakfast", icon: "🍳", hint: "صبحانه" },
  { key: "lunch", icon: "🍲", hint: "ناهار" },
  { key: "dinner", icon: "🌙", hint: "شام" },
  { key: "snack", icon: "🍎", hint: "میان‌وعده" },
];

const TIERS = [
  { key: "اقتصادی", desc: "تمرکز روی کمترین هزینه", icon: "🌱" },
  { key: "متعادل", desc: "تعادل بین هزینه، تنوع و کیفیت", icon: "⚖️" },
  { key: "منعطف", desc: "بودجه محدودیت کمتری دارد", icon: "✨" },
] as const;

export default function PlannerPage() {
  const router = useRouter();
  const store = useFridgeChef();
  const [step, setStep] = useState(0);
  const [budgetText, setBudgetText] = useState("4000000");
  const [people, setPeople] = useState(4);
  const [days, setDays] = useState(7);
  const [slots, setSlots] = useState<MealSlot[]>(["lunch", "dinner"]);
  const [liked, setLiked] = useState("");
  const [disliked, setDisliked] = useState("");
  const [allergies, setAllergies] = useState("");
  const [region, setRegion] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestAs, setRequestAs] = useState<"ai" | "demo">("demo");
  const aiConfigured = isAiConfigured();

  const budgetToman = useMemo(
    () => parsePersianNumber(budgetText) ?? 0,
    [budgetText],
  );

  const canNext = useMemo(() => {
    if (step === 1) return budgetToman >= 100_000 && people >= 1;
    if (step === 2) return slots.length > 0;
    return true;
  }, [step, budgetToman, people, slots]);

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    const req = plannerRequestFrom(
      store.pantry,
      {
        ...store.prefs,
        liked: splitList(liked),
        disliked: splitList(disliked),
        allergies: splitList(allergies),
        region: region || null,
        city: city || null,
      },
      budgetToman,
      people,
      days,
      slots,
      requestAs,
    );

    // Give the orbital animation its cinematic run while we fetch.
    const minDuration = 8800;
    const started = Date.now();
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "خطا در ساخت برنامه");
      }
      const data = (await res.json()) as { plan: WeeklyPlan; mode: "ai" | "demo" };
      const elapsed = Date.now() - started;
      if (elapsed < minDuration) {
        await new Promise((r) => setTimeout(r, minDuration - elapsed));
      }
      store.setPlan(data.plan, data.mode);
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
      setGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetToman, people, days, slots, liked, disliked, allergies, region, city, store.pantry, store.prefs, router]);

  if (generating) {
    return (
      <GenerationOrbit
        ingredientIds={store.pantry}
        onDone={() => {
          /* navigation happens after fetch resolves */
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-display text-3xl font-black">برنامه‌ریزی غذای هفتگی</h1>
      <p className="mb-8 text-charcoal-700">
        بودجه‌ات رو بگو، نفرات رو مشخص کن؛ برنامه و لیست خریدت آماده می‌شود.
      </p>

      {/* Step indicator (RTL) */}
      <ol className="mb-8 flex items-center gap-2" aria-label="مراحل">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                i <= step
                  ? "bg-saffron-500 text-white"
                  : "bg-cream-200 text-charcoal-700/60"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {toPersianDigits(i + 1)}
            </button>
            <span
              className={`hidden text-xs sm:inline ${
                i === step ? "font-bold text-charcoal-900" : "text-charcoal-700/60"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 rounded bg-cream-200">
                <motion.div
                  className="h-full rounded bg-saffron-400"
                  initial={false}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          className="glass rounded-3xl p-6 card-shadow md:p-8"
        >
          {step === 0 && (
            <div>
              <h2 className="mb-1 text-xl font-extrabold">چه چیزهایی توی خونه داری؟</h2>
              <p className="mb-5 text-sm text-charcoal-700/70">
                این مواد در لیست خرید حساب نمی‌شوند. (اختیاری)
              </p>
              <IngredientField
                value={store.pantry}
                onChange={(ids) => {
                  // store expects ids; replace all
                  useFridgeChef.setState({ pantry: ids });
                }}
              />
              <p className="mt-3 text-xs text-charcoal-700/50">
                {toPersianDigits(store.pantry.length)} ماده اضافه شد — می‌توانی این مرحله را رد کنی.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="budget" className="mb-2 block text-xl font-extrabold">
                  بودجه هفتگی شما چقدر است؟
                </label>
                <div className="glass flex items-center gap-2 rounded-2xl p-4">
                  <input
                    id="budget"
                    inputMode="numeric"
                    value={budgetText}
                    onChange={(e) => setBudgetText(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none"
                    placeholder="۲٬۵۰۰٬۰۰۰"
                    aria-describedby="budget-hint"
                  />
                  <span className="shrink-0 text-lg font-bold text-charcoal-700">تومان</span>
                </div>
                <p id="budget-hint" className="mt-2 text-xs text-charcoal-700/60">
                  {budgetToman >= 100_000 ? (
                    <>معادل {formatToman(budgetToman)} در هفته</>
                  ) : (
                    "حداقل ۱۰۰٬۰۰۰ تومان وارد کنید (فارسی یا انگلیسی)"
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[2500000, 4000000, 6000000].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudgetText(String(b))}
                      className="rounded-full border border-cream-300 bg-white/70 px-3 py-1 text-xs font-bold transition-colors hover:bg-cream-100"
                    >
                      {formatToman(b)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xl font-extrabold">برای چند نفر؟</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPeople((p) => Math.max(1, p - 1))}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-cream-300 bg-white text-xl font-black transition-colors hover:bg-cream-100"
                    aria-label="کاهش تعداد نفرات"
                  >
                    −
                  </button>
                  <motion.span
                    key={people}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={SPRINGS.snappy}
                    className="min-w-20 text-center text-2xl font-black"
                  >
                    {toPersianDigits(people)} نفر
                  </motion.span>
                  <button
                    onClick={() => setPeople((p) => Math.min(20, p + 1))}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-cream-300 bg-white text-xl font-black transition-colors hover:bg-cream-100"
                    aria-label="افزایش تعداد نفرات"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xl font-extrabold">چند روز؟</span>
                <div className="flex gap-2">
                  {[3, 5, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                        days === d
                          ? "bg-saffron-500 text-white shadow"
                          : "border border-cream-300 bg-white hover:bg-cream-100"
                      }`}
                    >
                      {toPersianDigits(d)} روز
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1 text-xl font-extrabold">کدام وعده‌ها؟</h2>
              <p className="mb-5 text-sm text-charcoal-700/70">هر ترکیبی که می‌خواهی انتخاب کن.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SLOT_OPTIONS.map((opt) => {
                  const selected = slots.includes(opt.key);
                  return (
                    <motion.button
                      key={opt.key}
                      onClick={() =>
                        setSlots((s) =>
                          s.includes(opt.key) ? s.filter((x) => x !== opt.key) : [...s, opt.key],
                        )
                      }
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
                        selected
                          ? "border-saffron-400 bg-saffron-50"
                          : "border-cream-200 bg-white hover:border-cream-300"
                      }`}
                      aria-pressed={selected}
                    >
                      <span className="text-3xl" aria-hidden>{opt.icon}</span>
                      <span className="text-sm font-bold">{opt.hint}</span>
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] transition-all ${
                          selected
                            ? "border-saffron-500 bg-saffron-500 text-white"
                            : "border-cream-300 text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold">ترجیحات (اختیاری)</h2>
              <LabeledInput label="غذاهایی که دوست دارم" value={liked} onChange={setLiked} placeholder="مثلاً: عدس‌پلو، ته‌چین" />
              <LabeledInput label="غذاهایی که دوست ندارم" value={disliked} onChange={setDisliked} placeholder="مثلاً: آبگوشت" />
              <LabeledInput label="حساسیت‌های غذایی" value={allergies} onChange={setAllergies} placeholder="مثلاً: بادام‌زمینی" />

              <div>
                <span className="mb-2 block text-sm font-bold">نحوهٔ تهیهٔ برنامه</span>
                <div
                  className={`flex rounded-2xl border p-1 ${
                    aiConfigured
                      ? "border-cream-200 bg-cream-50"
                      : "border-cream-200 bg-cream-50 opacity-70"
                  }`}
                  role="group"
                  aria-label="نحوهٔ تهیهٔ برنامه"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={requestAs === "demo"}
                    onClick={() => setRequestAs("demo")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold transition-colors ${
                      requestAs === "demo"
                        ? "bg-white text-charcoal-800 shadow-sm"
                        : "text-charcoal-700/60 hover:text-charcoal-800"
                    }`}
                  >
                    <span aria-hidden>📋</span>
                    نسخهٔ آماده
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={requestAs === "ai"}
                    onClick={() => requestAs !== "ai" || aiConfigured ? setRequestAs("ai") : null}
                    disabled={!aiConfigured}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold transition-colors ${
                      requestAs === "ai"
                        ? "bg-white text-charcoal-800 shadow-sm"
                        : "text-charcoal-700/60 hover:text-charcoal-800"
                    } ${!aiConfigured ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span aria-hidden>🤖</span>
                    نسخهٔ هوشمند (AI)
                  </button>
                </div>
                {!aiConfigured ? (
                  <p className="mt-2 text-xs text-charcoal-700/50">
                    برای فعال‌سازی نسخهٔ هوشمند، کلید API (مثلاً GEMINI_API_KEY یا OPENAI_API_KEY_1) را در فایل .env.local اضافه کنید.
                  </p>
                ) : requestAs === "ai" ? (
                  <p className="mt-2 text-xs text-charcoal-700/50">
                    ✅ آمادهٔ تولید با هوشمند. برنامه بر اساس سلیقهٔ شما با مدل زبانی ساخته می‌شود.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">سبک منطقه‌ای</span>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">فرقی نمی‌کند</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">شهر (برای قیمت تقریبی)</span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">انتخاب نشده</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <span className="mb-2 block text-sm font-bold">سطح بودجه</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {TIERS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => useFridgeChef.setState((s) => ({ prefs: { ...s.prefs, tier: t.key } }))}
                      className={`rounded-2xl border-2 p-3 text-right transition-colors ${
                        store.prefs.tier === t.key
                          ? "border-saffron-400 bg-saffron-50"
                          : "border-cream-200 bg-white hover:border-cream-300"
                      }`}
                    >
                      <span className="block text-lg" aria-hidden>{t.icon}</span>
                      <span className="block text-sm font-extrabold">{t.key}</span>
                      <span className="block text-xs text-charcoal-700/60">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl bg-pomegranate-50 px-4 py-3 text-sm font-bold text-pomegranate-700"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl px-5 py-3 text-sm font-bold text-charcoal-700 transition-colors hover:bg-cream-100 disabled:opacity-40"
        >
          مرحله قبل
        </button>

        {step < STEPS.length - 1 ? (
          <MagneticButton
            onClick={() => canNext && setStep((s) => s + 1)}
            disabled={!canNext}
            className="rounded-xl bg-charcoal-800 px-8 py-3 text-sm font-extrabold text-white shadow-md transition-opacity disabled:opacity-40"
          >
            مرحله بعد
          </MagneticButton>
        ) : (
          <MagneticButton
            onClick={generate}
            className="rounded-xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-saffron-500/30"
          >
            ✨ ساخت برنامه هفتگی
          </MagneticButton>
        )}
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-saffron-400"
      />
    </label>
  );
}

function splitList(s: string): string[] {
  return s
    .split(/[,،\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}
