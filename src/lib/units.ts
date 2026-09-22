/** Iranian kitchen units */
export const UNITS = [
  "gram",
  "kilogram",
  "milliliter",
  "liter",
  "count",
  "package",
  "tablespoon",
  "teaspoon",
  "cup",
  "glass",
  "shotan",
  "bunch",
  "clove",
  "can",
  "slice",
] as const;

export type UnitKey = (typeof UNITS)[number];

const UNIT_LABELS: Record<UnitKey, string> = {
  gram: "گرم",
  kilogram: "کیلوگرم",
  milliliter: "میلی‌لیتر",
  liter: "لیتر",
  count: "عدد",
  package: "بسته",
  tablespoon: "قاشق غذاخوری",
  teaspoon: "قاشق چای‌خوری",
  cup: "پیمانه",
  glass: "لیوان",
  shotan: "استکان",
  bunch: "دسته",
  clove: "حبه",
  can: "قوطی",
  slice: "برش",
};

export function unitLabel(u: string): string {
  return UNIT_LABELS[u as UnitKey] ?? u;
}

/** «۵۰۰ گرم» / «۲ عدد» / «۰٫۷ کیلوگرم» */
export function formatQuantity(qty: number, unit: string): string {
  const faQty = String(qty)
    .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])
    .replace(/\./g, "٫");
  return `${faQty} ${unitLabel(unit)}`;
}
