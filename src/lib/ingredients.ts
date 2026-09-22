import { normalizeFa } from "./schemas";

export type IngredientCategory =
  | "produce"
  | "protein"
  | "dairy"
  | "legumes"
  | "grains"
  | "spices"
  | "other";

export interface IngredientDef {
  id: string;
  fa: string;
  emoji: string;
  category: IngredientCategory;
  /** rough Toman price per base unit — ESTIMATE only, clearly labeled in UI */
  pricePerUnit: number;
  baseUnit: string;
  aliases: string[];
}

/**
 * Base ingredient database for Iranian kitchens.
 * Prices are rough estimates in Toman per base unit and are labeled
 * «قیمت تقریبی» everywhere in the UI. They are NOT live market prices.
 */
export const INGREDIENTS: IngredientDef[] = [
  { id: "onion", fa: "پیاز", emoji: "🧅", category: "produce", pricePerUnit: 30000, baseUnit: "kilogram", aliases: ["پیاز خشک", "پیاز سفید", "پیاز قرمز"] },
  { id: "potato", fa: "سیب‌زمینی", emoji: "🥔", category: "produce", pricePerUnit: 35000, baseUnit: "kilogram", aliases: ["سیب زمینی", "زمینی"] },
  { id: "tomato", fa: "گوجه", emoji: "🍅", category: "produce", pricePerUnit: 40000, baseUnit: "kilogram", aliases: ["گوجه‌فرنگی", "گوجه فرنگی", "جوهره"] },
  { id: "cucumber", fa: "خیار", emoji: "🥒", category: "produce", pricePerUnit: 40000, baseUnit: "kilogram", aliases: ["خیار گوجه‌ای", "خیار سبدی"] },
  { id: "eggplant", fa: "بادمجان", emoji: "🍆", category: "produce", pricePerUnit: 40000, baseUnit: "kilogram", aliases: ["بادمجان دلمه‌ای", "بادنجان"] },
  { id: "bell_pepper", fa: "فلفل دلمه", emoji: "🫑", category: "produce", pricePerUnit: 90000, baseUnit: "kilogram", aliases: ["فلفل دلمه‌ای", "دلمه"] },
  { id: "carrot", fa: "هویج", emoji: "🥕", category: "produce", pricePerUnit: 30000, baseUnit: "kilogram", aliases: [] },
  { id: "spinach", fa: "اسفناج", emoji: "🥬", category: "produce", pricePerUnit: 30000, baseUnit: "kilogram", aliases: ["سبزی اسفناج"] },
  { id: "herbs", fa: "سبزی خوردن", emoji: "🌿", category: "produce", pricePerUnit: 40000, baseUnit: "bunch", aliases: ["سبزی", "سبزی خوردن تازه", "نعناع", "جعفری", "تره", "شنبلیله"] },
  { id: "garlic", fa: "سیر", emoji: "🧄", category: "produce", pricePerUnit: 200000, baseUnit: "kilogram", aliases: ["سیر تصفیه‌شده"] },
  { id: "lemon", fa: "لیمو ترش", emoji: "🍋", category: "produce", pricePerUnit: 80000, baseUnit: "kilogram", aliases: ["لیمو", "لیموترش", "آبلیمو"] },
  { id: "pomegranate", fa: "انار", emoji: "🍎", category: "produce", pricePerUnit: 120000, baseUnit: "kilogram", aliases: ["انار ساوه", "انار شیرین"] },
  { id: "apple", fa: "سیب", emoji: "🍏", category: "produce", pricePerUnit: 60000, baseUnit: "kilogram", aliases: ["سیب قرمز", "سیب سبز"] },
  { id: "egg", fa: "تخم‌مرغ", emoji: "🥚", category: "protein", pricePerUnit: 9000, baseUnit: "count", aliases: ["تخم مرغ", "مرغ تخم‌گذر"] },
  { id: "chicken", fa: "مرغ", emoji: "🍗", category: "protein", pricePerUnit: 120000, baseUnit: "kilogram", aliases: ["مرغ تازه", "ران مرغ", "سینه مرغ", "جوجه"] },
  { id: "ground_beef", fa: "گوشت چرخ‌کرده", emoji: "🥩", category: "protein", pricePerUnit: 600000, baseUnit: "kilogram", aliases: ["گوشت", "گوشت گوسفندی چرخ‌کرده", "قیمه‌ای"] },
  { id: "lamb_shank", fa: "مالج گوشت", emoji: "🍖", category: "protein", pricePerUnit: 700000, baseUnit: "kilogram", aliases: ["مالچ گوشت", "آبگوشتی"] },
  { id: "soy_protein", fa: "سویا", emoji: "🫘", category: "protein", pricePerUnit: 150000, baseUnit: "kilogram", aliases: ["پروتئین سویا", "سویا ریز"] },
  { id: "milk", fa: "شیر", emoji: "🥛", category: "dairy", pricePerUnit: 35000, baseUnit: "liter", aliases: ["شیر پرچرب", "شیر کم‌چرب"] },
  { id: "yogurt", fa: "ماست", emoji: "🍶", category: "dairy", pricePerUnit: 70000, baseUnit: "kilogram", aliases: ["ماست موسیر", "ماست چکیده"] },
  { id: "cheese", fa: "پنیر", emoji: "🧀", category: "dairy", pricePerUnit: 180000, baseUnit: "kilogram", aliases: ["پنیر لیقوان", "پنیر ایرانی", "پنیر فتا"] },
  { id: "butter", fa: "کره", emoji: "🧈", category: "dairy", pricePerUnit: 350000, baseUnit: "kilogram", aliases: ["کره حیوانی"] },
  { id: "kashek", fa: "کشک", emoji: "🫙", category: "dairy", pricePerUnit: 90000, baseUnit: "liter", aliases: ["کشک ایرانی"] },
  { id: "rice", fa: "برنج", emoji: "🍚", category: "grains", pricePerUnit: 180000, baseUnit: "kilogram", aliases: ["برنج ایرانی", "برنج طارم", "برنج هاشمی", "برنج دم سیاه"] },
  { id: "pasta", fa: "ماکارونی", emoji: "🍝", category: "grains", pricePerUnit: 50000, baseUnit: "package", aliases: ["ماکارونی فرمی", "ماکارونی رشته‌ای", "پاستا"] },
  { id: "bread", fa: "نان", emoji: "🥖", category: "grains", pricePerUnit: 5000, baseUnit: "count", aliases: ["نان بربری", "نان لواش", "نان سنگک", "نان تافتون"] },
  { id: "flour", fa: "آرد", emoji: "🌾", category: "grains", pricePerUnit: 30000, baseUnit: "kilogram", aliases: ["آرد سفید", "آرد گندم"] },
  { id: "potato_chip_fries", fa: "سیب‌زمینی خردشده", emoji: "🍟", category: "grains", pricePerUnit: 60000, baseUnit: "kilogram", aliases: ["سیب‌زمینی سرخ‌کردنی"] },
  { id: "lentil", fa: "عدس", emoji: "🫘", category: "legumes", pricePerUnit: 120000, baseUnit: "kilogram", aliases: ["عدس پلویی"] },
  { id: "bean", fa: "لوبیا", emoji: "🫘", category: "legumes", pricePerUnit: 130000, baseUnit: "kilogram", aliases: ["لوبیا چیتی", "لوبیا قرمز", "لوبیا سفید"] },
  { id: "chickpea", fa: "نخود", emoji: "🫛", category: "legumes", pricePerUnit: 120000, baseUnit: "kilogram", aliases: ["نخود آبگوشتی", "نخود سیاه"] },
  { id: "green_pea", fa: "نخود فرنگی", emoji: "🫛", category: "legumes", pricePerUnit: 100000, baseUnit: "kilogram", aliases: ["نخود سبز"] },
  { id: "barberry", fa: "زرشک", emoji: "🔴", category: "spices", pricePerUnit: 250000, baseUnit: "kilogram", aliases: ["زرشک پلویی"] },
  { id: "saffron", fa: "زعفران", emoji: "🌸", category: "spices", pricePerUnit: 900000, baseUnit: "gram", aliases: ["زعفران سرگل"] },
  { id: "turmeric", fa: "زردچوبه", emoji: "🟡", category: "spices", pricePerUnit: 200000, baseUnit: "kilogram", aliases: [] },
  { id: "tomato_paste", fa: "رب گوجه", emoji: "🥫", category: "spices", pricePerUnit: 180000, baseUnit: "kilogram", aliases: ["رب", "رب خانگی"] },
  { id: "oil", fa: "روغن", emoji: "🛢️", category: "spices", pricePerUnit: 150000, baseUnit: "liter", aliases: ["روغن سرخ‌کردنی", "روغن مایع", "روغن زیتون"] },
  { id: "dried_lime", fa: "لیمو عمانی", emoji: "🟤", category: "spices", pricePerUnit: 300000, baseUnit: "kilogram", aliases: ["لیمو امانی", "لیمو خشک"] },
  { id: "sumac", fa: "سماق", emoji: "🟫", category: "spices", pricePerUnit: 200000, baseUnit: "kilogram", aliases: [] },
  { id: "advieh", fa: "ادویه پلویی", emoji: "🧂", category: "spices", pricePerUnit: 300000, baseUnit: "kilogram", aliases: ["ادویه", "پودر کاری"] },
  { id: "sugar", fa: "شکر", emoji: "🧂", category: "other", pricePerUnit: 60000, baseUnit: "kilogram", aliases: ["قند"] },
  { id: "tea", fa: "چای", emoji: "🍵", category: "other", pricePerUnit: 500000, baseUnit: "kilogram", aliases: ["چای سیاه", "چای کیسه‌ای"] },
  { id: "walnut", fa: "گردو", emoji: "🥜", category: "other", pricePerUnit: 900000, baseUnit: "kilogram", aliases: ["گردو تازه"] },
  { id: "raisin", fa: "کشمش", emoji: "🍇", category: "other", pricePerUnit: 250000, baseUnit: "kilogram", aliases: ["کشمش پلویی", "کشمش سبز"] },
  { id: "date", fa: "خرما", emoji: "🌴", category: "other", pricePerUnit: 100000, baseUnit: "kilogram", aliases: ["خرمای مضافتی"] },
];

const byAlias = new Map<string, IngredientDef>();
for (const ing of INGREDIENTS) {
  byAlias.set(normalizeFa(ing.fa), ing);
  byAlias.set(ing.id, ing);
  for (const alias of ing.aliases) byAlias.set(normalizeFa(alias), ing);
}

/** Find an ingredient by Persian name, alias, or internal id */
export function findIngredient(input: string): IngredientDef | undefined {
  return byAlias.get(normalizeFa(input));
}

/** Map free text to ingredient id, or null */
export function toIngredientId(input: string): string | null {
  const found = findIngredient(input);
  return found ? found.id : null;
}

/** Persian display name for an ingredient id (falls back to the id itself) */
export function ingredientFa(id: string): string {
  return findIngredient(id)?.fa ?? id;
}

export function ingredientEmoji(id: string): string {
  return findIngredient(id)?.emoji ?? "🥘";
}

/** Rough estimate: Toman price for a given qty+unit of an ingredient id */
export function estimateIngredientCost(
  id: string,
  qty: number,
  unit: string,
): number {
  const ing = findIngredient(id);
  if (!ing) return 0;
  // Convert qty+unit to the ingredient's base unit scale (very rough)
  const toBase: Record<string, number> = {
    gram: 0.001,
    kilogram: 1,
    milliliter: 0.001,
    liter: 1,
    count: unit === ing.baseUnit ? 1 : 1,
    package: 1,
    bunch: 1,
    tablespoon: 0.015,
    teaspoon: 0.005,
    cup: 0.2,
    glass: 0.25,
    shotan: 0.2,
    clove: 0.003,
    can: 0.4,
    slice: 0.02,
  };
  const factor = toBase[unit] ?? 1;
  return Math.round(ing.pricePerUnit * qty * factor);
}

export const CITIES = [
  "تهران",
  "کرج",
  "مشهد",
  "اصفهان",
  "شیراز",
  "تبریز",
  "رشت",
  "اهواز",
  "قم",
  "کرمان",
  "سایر شهرها",
] as const;

export const REGIONS = [
  "تهرانی",
  "شمالی",
  "گیلانی",
  "مازندرانی",
  "آذری",
  "کردی",
  "جنوبی",
  "خراسانی",
  "اصفهانی",
  "شیرازی",
  "یزدی",
  "کرمانی",
  "لری",
  "ترکی",
  "عربی جنوبی",
  "غذاهای متنوع",
] as const;
