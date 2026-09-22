"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useFridgeChef } from "@/lib/store";
import { formatToman, formatNumber, toPersianDigits } from "@/lib/format";
import { CITIES, REGIONS } from "@/lib/ingredients";
import { tomanToRial, formatToman as fmtT } from "@/lib/format";

export default function SettingsPage() {
  const prefs = useFridgeChef((s) => s.prefs);
  const setPrefs = useFridgeChef((s) => s.setPrefs);
  const clearPlan = useFridgeChef((s) => s.clearPlan);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-display text-3xl font-black">تنظیمات</h1>
      <p className="mb-8 text-charcoal-700">تنظیمات نمایش و شخصی‌سازی برنامه.</p>

      <div className="flex flex-col gap-6">
        {/* Currency */}
        <section className="glass rounded-3xl p-6 card-shadow" aria-label="واحد پول">
          <h2 className="mb-1 text-lg font-extrabold">واحد پول</h2>
          <p className="mb-4 text-sm text-charcoal-700/70">
            نمایش مبالغ با تومان یا ریال. محاسبات داخلی همیشه بر اساس تومان است.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "toman", label: "تومان", example: 2500000 },
                { key: "rial", label: "ریال", example: 25000000 },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPrefs({ currency: opt.key })}
                className={`rounded-2xl border-2 p-4 text-center transition-colors ${
                  prefs.currency === opt.key
                    ? "border-saffron-400 bg-saffron-50"
                    : "border-cream-200 bg-white hover:border-cream-300"
                }`}
                aria-pressed={prefs.currency === opt.key}
              >
                <span className="block text-lg font-black">{opt.label}</span>
                <span className="mt-1 block text-xs text-charcoal-700/60">
                  {opt.key === "toman"
                    ? formatToman(opt.example)
                    : `${formatNumber(tomanToRial(opt.example))} ریال`}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* City */}
        <section className="glass rounded-3xl p-6 card-shadow" aria-label="شهر">
          <h2 className="mb-1 text-lg font-extrabold">شهر</h2>
          <p className="mb-4 text-sm text-charcoal-700/70">
            برای تخمین قیمت‌های محلی (در نسخه‌های بعدی). دسترسی مکانی لازم نیست.
          </p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setPrefs({ city: c })}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  prefs.city === c
                    ? "bg-charcoal-800 text-white"
                    : "border border-cream-300 bg-white hover:bg-cream-100"
                }`}
                aria-pressed={prefs.city === c}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Region */}
        <section className="glass rounded-3xl p-6 card-shadow" aria-label="سبک منطقه‌ای">
          <h2 className="mb-1 text-lg font-extrabold">سبک غذای منطقه‌ای</h2>
          <p className="mb-4 text-sm text-charcoal-700/70">
            برنامه‌ریزی می‌تواند به سبک آشپزی منطقه شما نزدیک‌تر شود. (اختیاری)
          </p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setPrefs({ region: r })}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  prefs.region === r
                    ? "bg-charcoal-800 text-white"
                    : "border border-cream-300 bg-white hover:bg-cream-100"
                }`}
                aria-pressed={prefs.region === r}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Data */}
        <section className="glass rounded-3xl p-6 card-shadow" aria-label="داده‌ها">
          <h2 className="mb-1 text-lg font-extrabold">داده‌های من</h2>
          <p className="mb-4 text-sm text-charcoal-700/70">
            برنامه فعلی، ذخیره‌شده‌ها و تنظیمات روی همین مرورگر ذخیره می‌شوند.
          </p>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="rounded-xl border border-pomegranate-200 bg-pomegranate-50 px-5 py-3 text-sm font-bold text-pomegranate-700 transition-colors hover:bg-pomegranate-100"
            >
              پاک کردن همه داده‌ها
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => {
                  useFridgeChef.persist.clearStorage();
                  window.location.reload();
                }}
                className="rounded-xl bg-pomegranate-600 px-5 py-3 text-sm font-extrabold text-white"
              >
                بله، همه چیز پاک شود
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-xl px-5 py-3 text-sm font-bold text-charcoal-700 hover:bg-cream-100"
              >
                انصراف
              </button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
