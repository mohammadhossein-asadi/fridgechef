"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRINGS } from "@/motion/transitions";
import { useFridgeChef } from "@/lib/store";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/planner", label: "برنامه‌ریزی غذا" },
  { href: "/plan", label: "برنامه هفتگی" },
  { href: "/recipes", label: "دستورهای پخت" },
  { href: "/shopping", label: "لیست خرید" },
  { href: "/saved", label: "ذخیره‌شده‌ها" },
  { href: "/settings", label: "تنظیمات" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const prefs = useFridgeChef((s) => s.prefs);

  return (
    <header className="glass sticky top-0 z-50 border-b border-cream-200/60 dark:border-white/10">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="ناوبری اصلی">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
          <motion.span
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-saffron-400 to-pomegranate-500 text-lg shadow-md"
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={SPRINGS.snappy}
            aria-hidden
          >
            🍲
          </motion.span>
          <span className="font-display">فریدج‌شف</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cream-100 dark:hover:bg-white/10 ${
                    active ? "font-bold text-saffron-700 dark:text-saffron-400" : "text-charcoal-700 dark:text-slate-200"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-saffron-500"
                      transition={SPRINGS.snappy}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {prefs.currency === "toman" ? null : (
            <span className="hidden text-xs text-charcoal-700/70 md:inline">ریال</span>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-cream-100 dark:hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="باز و بسته کردن منو"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-cream-200/60 dark:border-white/10 lg:hidden"
          >
            {LINKS.map((link, i) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-6 py-3 text-sm ${
                    pathname === link.href ? "font-bold text-saffron-700 dark:text-saffron-400" : "text-charcoal-700 dark:text-slate-200"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
