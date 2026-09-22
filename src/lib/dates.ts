import {
  toJalaali,
  toGregorian,
  jalaaliMonthLength,
  isValidJalaaliDate,
} from "jalaali-js";

export const IRANIAN_WEEK_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

export type IranianWeekday = (typeof IRANIAN_WEEK_DAYS)[number];

/** index into IRANIAN_WEEK_DAYS for a JS Date (JS: 0=Sun .. 6=Sat) */
export function iranianWeekdayIndex(date: Date): number {
  const jsDay = date.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  // Iranian week starts Saturday: شنبه=0(Sat), یکشنبه=1(Sun), دوشنبه=2(Mon)...
  return (jsDay + 1) % 7;
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export function toJalali(date: Date): JalaliDate {
  return toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ) as unknown as JalaliDate;
}

export function jalaliToDate(jy: number, jm: number, jd: number): Date {
  const g = toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export { isValidJalaaliDate, jalaaliMonthLength };

/** «شنبه ۲۸ شهریور» */
export function formatJalaliDayMonth(date: Date): string {
  const { jm, jd } = toJalali(date);
  const weekday = IRANIAN_WEEK_DAYS[iranianWeekdayIndex(date)];
  return `${weekday} ${toFa(jd)} ${JALALI_MONTHS[jm - 1]}`;
}

/** «۲۸ شهریور ۱۴۰۴» */
export function formatJalaliFull(date: Date): string {
  const { jy, jm, jd } = toJalali(date);
  return `${toFa(jd)} ${JALALI_MONTHS[jm - 1]} ${toFa(jy)}`;
}

function toFa(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Next Saturday (start of Iranian week) on/after the given date */
export function nextIranianWeekStart(from: Date = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const idx = iranianWeekdayIndex(d); // 0 = Saturday
  const delta = idx === 0 ? 0 : 7 - idx;
  d.setDate(d.getDate() + delta);
  return d;
}
