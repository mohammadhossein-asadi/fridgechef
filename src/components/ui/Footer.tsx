import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cream-200/60 py-10 text-center text-sm text-charcoal-700/80">
      <p className="mb-2 font-bold text-charcoal-800">
        فریدج‌شف — دستیار غذای هوشمند ایرانی
      </p>
      <p className="mb-4">
        با چیزهایی که از قبل داری، کمتر بخر و کمتر دور بریز.
      </p>
      <nav className="flex flex-wrap justify-center gap-4" aria-label="پیوندهای پاورقی">
        <Link href="/planner" className="hover:text-saffron-700">برنامه‌ریزی غذا</Link>
        <Link href="/recipes" className="hover:text-saffron-700">دستورهای پخت</Link>
        <Link href="/shopping" className="hover:text-saffron-700">لیست خرید</Link>
        <Link href="/settings" className="hover:text-saffron-700">تنظیمات</Link>
      </nav>
      <p className="mt-6 text-xs text-charcoal-700/60">
        قیمت‌های نمایش‌داده‌شده تقریبی هستند و ممکن است با بازار محلی شما تفاوت داشته باشند.
      </p>
    </footer>
  );
}
