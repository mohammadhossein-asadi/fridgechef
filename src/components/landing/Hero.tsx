"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { MagneticButton } from "@/motion/MagneticButton";
import { SPRINGS } from "@/motion/transitions";
import { useReducedMotion } from "@/motion/presets";

const Hero3D = dynamic(() => import("@/components/3d/Hero3D"), { ssr: false });

export function Hero() {
  const [starting, setStarting] = useState(false);
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      {/* 3D background scene */}
      <Hero3D onPlanning={() => setStarting(true)} />

      {/* Foreground copy */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: starting ? 0 : 1, y: starting ? -40 : 0 }}
          transition={{ duration: reduced ? 0.2 : 0.7, ease: [0, 0, 0.2, 1] }}
        >
          <motion.p
            className="mb-4 inline-block rounded-full bg-white/60 dark:bg-[var(--card)] px-4 py-1.5 text-sm font-bold text-saffron-700 dark:text-saffron-300 shadow-sm backdrop-blur"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRINGS.gentle, delay: 0.15 }}
          >
            مواد غذایی ← برنامه‌ریزی ← غذا
          </motion.p>

          <h1 className="text-balance font-display text-4xl font-black leading-[1.25] text-charcoal-900 dark:text-[var(--foreground)] md:text-6xl md:leading-[1.2]">
            این هفته با بودجه‌ات
            <span className="mx-2 bg-gradient-to-l from-saffron-600 via-pomegranate-500 to-saffron-600 dark:from-saffron-300 dark:via-pomegranate-300 dark:to-saffron-300 bg-clip-text text-transparent">
              چی بپزی؟
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-charcoal-700 dark:text-[var(--foreground)]/80">
            بودجه‌ات رو بگو، تعداد نفرات رو مشخص کن؛ برنامه غذایی هفته‌ات و
            لیست خرید بهینه رو بساز. با چیزهایی که از قبل داری، کمتر بخر و
            کمتر دور بریز.
          </p>

          <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton
              onClick={() => setStarting(true)}
              className="rounded-2xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-saffron-500/30 transition-shadow hover:shadow-xl hover:shadow-saffron-500/40"
            >
              <span className="flex items-center gap-2">
                شروع برنامه‌ریزی
                <motion.span
                  aria-hidden
                  animate={{ x: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                  ←
                </motion.span>
              </span>
            </MagneticButton>

            <motion.a
              href="#how"
              className="rounded-2xl border border-cream-300 dark:border-[var(--border)] bg-white/70 dark:bg-[var(--card)] px-6 py-4 font-bold text-charcoal-800 dark:text-[var(--foreground)] backdrop-blur transition-colors hover:bg-white dark:hover:bg-[var(--card-2)]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              چطور کار می‌کند؟
            </motion.a>
          </div>

          <p className="mt-6 text-xs text-charcoal-700/60 dark:text-[var(--muted)]">
            بدون نیاز به کارت بانکی · حالت نمایشی کامل بدون API · ساخته‌شده برای آشپزخانه ایرانی
          </p>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <AnimatePresence>
        {!starting && (
          <motion.div
            className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ y: { repeat: Infinity, duration: 1.8 }, opacity: { delay: 1 } }}
            aria-hidden
          >
            <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-charcoal-700/30 dark:border-[var(--border)] p-1">
              <div className="h-2 w-1 rounded-full bg-charcoal-700/40 dark:bg-[var(--muted)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
