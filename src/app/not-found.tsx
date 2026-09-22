import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
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
    </main>
  );
}
