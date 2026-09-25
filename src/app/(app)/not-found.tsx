import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 text-8xl" aria-hidden>🍲</div>
      <h1 className="mb-3 font-display text-3xl font-black">این صفحه توی آشپزخانه ما نیست</h1>
      <p className="mb-8 max-w-md text-charcoal-700">
        صفحه‌ای که دنبالش بودی پیدا نشد. بیا برگردیم سراغ آشپزی.
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-8 py-4 font-extrabold text-white shadow-lg"
      >
        بازگشت به خانه
      </Link>
    </div>
  );
}
