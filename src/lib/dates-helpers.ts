export {
  IRANIAN_WEEK_DAYS,
  JALALI_MONTHS,
  toJalali,
  formatJalaliDayMonth,
  formatJalaliFull,
  iranianWeekdayIndex,
  nextIranianWeekStart,
} from "./dates";

export function toFaDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
