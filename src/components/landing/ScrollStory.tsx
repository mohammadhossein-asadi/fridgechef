"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { Reveal, StaggerContainer, StaggerItem } from "@/motion/Reveal";
import { MagneticButton } from "@/motion/MagneticButton";
import { useReducedMotion } from "@/motion/presets";
import { formatCompactToman } from "@/lib/format";
import { MoneyTip } from "@/components/MoneyTip";
import { ingredientEmoji, ingredientFa } from "@/lib/ingredients";

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto max-w-6xl px-6 py-24 md:py-32 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className="mb-12 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
    >
      <p className="mb-3 text-sm font-bold text-saffron-600">{kicker}</p>
      <h2 className="text-balance font-display text-3xl font-black text-charcoal-900 md:text-5xl md:leading-snug">
        {title}
      </h2>
    </motion.div>
  );
}

/** Section 1 — What do you have? */
function SectionPantry() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [70, -30]);

  const chips = [
    "egg", "tomato", "onion", "potato", "rice", "chicken",
    "herbs", "cheese", "lentil", "lemon",
  ];

  return (
    <Section id="how">
      <div ref={ref} className="grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-sm font-bold text-saffron-600">قدم اول</p>
          <h2 className="text-balance font-display text-3xl font-black leading-snug text-charcoal-900 md:text-4xl">
            چه چیزهایی توی خونه داری؟
          </h2>
          <p className="mt-5 leading-8 text-charcoal-700">
            مواد موجود در یخچالت رو اضافه کن — تخم‌مرغ، برنج، پیاز، سبزی...
            ما این‌ها رو مبنای برنامه هفته قرار می‌دیم تا خرید کمتری نیاز داشته باشی.
          </p>
        </Reveal>

        <motion.div
          style={reduced ? undefined : { y: y1 }}
          className="glass relative rounded-3xl p-8 card-shadow"
        >
          <div className="mb-4 text-sm font-bold text-charcoal-700">مواد غذایی من</div>
          <StaggerContainer className="flex flex-wrap gap-3" stagger={0.06}>
            {chips.map((id) => (
              <StaggerItem key={id}>
                <motion.span
                  className="flex items-center gap-2 rounded-2xl border border-cream-200 bg-white/80 px-4 py-2 text-sm font-bold shadow-sm"
                  whileHover={{ y: -4, scale: 1.05, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <span aria-hidden>{ingredientEmoji(id)}</span>
                  {ingredientFa(id)}
                </motion.span>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <motion.div
            style={reduced ? undefined : { y: y2 }}
            className="pointer-events-none absolute -left-6 -top-6 -z-10 text-6xl opacity-20"
            aria-hidden
          >
            🧺
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

/** Section 2 — AI finds possibilities (connecting diagram) */
function SectionAI() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineGrow = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);
  const shown = useInView(ref, { once: true, margin: "-80px" });

  const nodes = [
    { id: "onion", x: "12%", y: "22%" },
    { id: "tomato", x: "78%", y: "18%" },
    { id: "egg", x: "22%", y: "68%" },
    { id: "rice", x: "68%", y: "70%" },
    { id: "herbs", x: "46%", y: "10%" },
    { id: "chicken", x: "88%", y: "48%" },
    { id: "lentil", x: "6%", y: "48%" },
    { id: "oil", x: "45%", y: "82%" },
  ];

  return (
    <Section>
      <SectionTitle
        kicker="قدم دوم"
        title="هوش مصنوعی امکان‌ها رو پیدا می‌کند"
      />
      <div ref={ref} className="glass relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-3xl card-shadow md:aspect-[16/8]">
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <motion.line
            x1="12%" y1="22%" x2="78%" y2="18%"
            stroke="#ffbf4d" strokeWidth="1.5" strokeLinecap="round"
            style={{ pathLength: reduced ? 1 : lineGrow }}
          />
          <motion.line
            x1="22%" y1="68%" x2="68%" y2="70%"
            stroke="#ffbf4d" strokeWidth="1.5" strokeLinecap="round"
            style={{ pathLength: reduced ? 1 : lineGrow }}
          />
          <motion.line
            x1="46%" y1="10%" x2="45%" y2="82%"
            stroke="#e7cba2" strokeWidth="1.5" strokeLinecap="round"
            style={{ pathLength: reduced ? 1 : lineGrow }}
          />
          <motion.line
            x1="6%" y1="48%" x2="88%" y2="48%"
            stroke="#e7cba2" strokeWidth="1.5" strokeLinecap="round"
            style={{ pathLength: reduced ? 1 : lineGrow }}
          />
        </svg>

        {nodes.map((n, i) => (
          <motion.div
            key={n.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-cream-200 bg-white/90 px-3 py-1.5 text-xs font-bold shadow-md"
            style={{ left: n.x, top: n.y }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 20 }}
          >
            <span aria-hidden>{ingredientEmoji(n.id)}</span>
            {ingredientFa(n.id)}
          </motion.div>
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-5 py-3 font-extrabold text-white shadow-xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 16 }}
        >
          <motion.span
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            aria-hidden
          >
            ✨
          </motion.span>
          تحلیل مواد و بودجه
        </motion.div>
      </div>
    </Section>
  );
}

/** Section 3 — recipes emerge */
function SectionRecipes() {
  const cards = [
    { emoji: "🍚", name: "عدس‌پلو", time: "۸۰ دقیقه", cost: 680000 },
    { emoji: "🥘", name: "کوکو سبزی", time: "۴۰ دقیقه", cost: 420000 },
    { emoji: "🍗", name: "جوجه کباب تابه‌ای", time: "۵۵ دقیقه", cost: 890000 },
    { emoji: "🍝", name: "ماکارونی ایرانی", time: "۶۰ دقیقه", cost: 540000 },
  ];

  return (
    <Section>
      <SectionTitle
        kicker="قدم سوم"
        title="غذاها بر اساس چیزی که داری ساخته می‌شوند"
      />
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {cards.map((c) => (
          <StaggerItem key={c.name}>
            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-cream-200 bg-white/85 p-6 card-shadow transition-shadow hover:card-shadow-lg"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <motion.div
                className="mb-4 text-5xl"
                whileHover={{ scale: 1.15, rotate: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                aria-hidden
              >
                {c.emoji}
              </motion.div>
              <h3 className="mb-1 text-lg font-extrabold text-charcoal-900">{c.name}</h3>
              <p className="mb-3 text-sm text-charcoal-700/70">{c.time}</p>
              <p className="text-sm font-bold">
                <MoneyTip value={c.cost} display={formatCompactToman(c.cost)} toneClass="text-pistachio-600" />
              </p>
              <p className="mt-2 text-xs text-charcoal-700/60">هزینه تقریبی</p>
            </motion.article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}

/** Section 4 — shopping list assembles itself */
function SectionShopping() {
  const items = [
    { name: "مرغ", emoji: "🍗", qty: "۱ کیلوگرم", price: 120000 },
    { name: "برنج", emoji: "🍚", qty: "۲ کیلوگرم", price: 500000 },
    { name: "ماست", emoji: "🍶", qty: "۱ عدد", price: 70000 },
    { name: "سبزی", emoji: "🌿", qty: "۱ دسته", price: 40000 },
  ];
  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2">
        <Reveal className="order-2 md:order-1">
          <motion.div
            className="glass rounded-3xl p-8 card-shadow"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-bold text-charcoal-700">لیست خرید این هفته</span>
              <span className="rounded-full bg-pistachio-100 px-3 py-1 text-xs font-bold text-pistachio-700">
                فقط چیزهای کم‌موجود
              </span>
            </div>
            <StaggerContainer className="flex flex-col gap-3" stagger={0.12}>
              {items.map((item) => (
                <StaggerItem key={item.name}>
                  <motion.div
                    className="flex items-center justify-between rounded-2xl border border-cream-200 bg-white/85 px-4 py-3"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100" aria-hidden>
                        {item.emoji}
                      </span>
                      <span>
                        <span className="block text-sm font-bold">{item.name}</span>
                        <span className="block text-xs text-charcoal-700/60">{item.qty}</span>
                      </span>
                    </span>
                    <span className="text-sm">
                      <MoneyTip value={item.price} display={formatCompactToman(item.price)} toneClass="text-charcoal-700/80" />
                    </span>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <div className="mt-5 flex justify-between border-t border-cream-200 pt-4 text-sm font-extrabold">
              <span>جمع تقریبی</span>
              <span>
                <MoneyTip value={total} display={formatCompactToman(total)} />
              </span>
            </div>
          </motion.div>
        </Reveal>

        <Reveal className="order-1 md:order-2">
          <p className="mb-3 text-sm font-bold text-saffron-600">قدم چهارم</p>
          <h2 className="text-balance font-display text-3xl font-black leading-snug text-charcoal-900 md:text-4xl">
            فقط چیزی رو بخر که کم داری
          </h2>
          <p className="mt-5 leading-8 text-charcoal-700">
            لیست خرید به‌طور خودکار از مواد مشترک غذاها ساخته می‌شود؛ چیزی که
            توی خونه داری حساب نمی‌شود و مواد تکراری یکی می‌شوند. نتیجه:
            خرید کمتر، دورریز کمتر، بودجه سالم.
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {[
              "ادغام هوشمند مواد مشترک بین غذاها",
              "حذف موارد موجود در یخچال شما",
              "دسته‌بندی ایرانی: میوه و سبزی، گوشت، لبنیات و...",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-pistachio-100 text-xs text-pistachio-700" aria-hidden>
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

/** Section 5 — final CTA */
function SectionCTA() {
  const reduced = useReducedMotion();
  return (
    <Section className="text-center">
      <Reveal>
        <div className="mb-6 flex justify-center gap-3 text-5xl" aria-hidden>
          {["🍳", "🥘", "🍲"].map((e, i) => (
            <motion.span
              key={e}
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.3, ease: "easeInOut" }}
            >
              {e}
            </motion.span>
          ))}
        </div>
        <h2 className="text-balance font-display text-4xl font-black leading-snug text-charcoal-900 md:text-5xl">
          بپز، میل کن، کمتر دور بریز
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-charcoal-700">
          برنامه هفتگی، لیست خرید بهینه و دستورهای آشنای ایرانی — همه بر اساس
          بودجه و سلیقه خودت. همین حالا شروع کن.
        </p>
        <div className="mt-8">
          <Link href="/planner">
            <MagneticButton className="rounded-2xl bg-gradient-to-l from-saffron-500 to-pomegranate-500 px-10 py-4 text-lg font-extrabold text-white shadow-lg shadow-saffron-500/30 transition-shadow hover:shadow-xl">
              ساخت برنامه هفتگی
            </MagneticButton>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}

export function ScrollStory() {
  return (
    <>
      <SectionPantry />
      <SectionAI />
      <SectionRecipes />
      <SectionShopping />
      <SectionCTA />
    </>
  );
}
