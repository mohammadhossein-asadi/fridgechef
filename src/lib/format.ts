/**
 * Persian number & currency formatting.
 * Internal money values are always stored in Toman (integers).
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Parse "۲٬۵۰۰٬۰۰۰", "2,500,000", " ۲۵۰۰۰۰۰ " → 2500000 (null when not a number) */
export function parsePersianNumber(input: string): number | null {
  const cleaned = toEnglishDigits(input)
    .replace(/[,٬،\s]/g, "")
    .replace(/[٫]/g, ".");
  if (!cleaned || isNaN(Number(cleaned))) return null;
  return Number(cleaned);
}

/** Format integer with Persian digits + Persian thousands separator */
export function formatNumber(value: number): string {
  const s = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toPersianDigits(s);
}

/** Format money stored in Toman */
export function formatToman(value: number, withCurrency = true): string {
  return `${formatNumber(value)}${withCurrency ? " تومان" : ""}`;
}

/** Compact money: ۲٫۵ میلیون تومان — for big numbers in tight UI */
export function formatCompactToman(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    const text = Number.isInteger(m) ? String(m) : m.toFixed(1);
    return `${toPersianDigits(text.replace(".", "٫"))} میلیون تومان`;
  }
  if (value >= 1000) {
    const k = Math.round(value / 1000);
    return `${formatNumber(k)} هزار تومان`;
  }
  return formatToman(value);
}

/** Percent with Persian digits */
export function formatPercent(ratio: number): string {
  return `${toPersianDigits(Math.round(ratio * 100))}٪`;
}

/** "x نفر" helper */
export function formatPeople(n: number): string {
  return `${formatNumber(n)} نفر`;
}

export function tomanToRial(toman: number): number {
  return toman * 10;
}

export function rialToToman(rial: number): number {
  return Math.round(rial / 10);
}
