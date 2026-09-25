import { describe, expect, it } from "vitest";
import { formatCompactToman, formatNumber, formatPercent, formatSignedToman, formatToman } from "./format";

// The minus sign must be the Unicode minus U+2212, not an ASCII hyphen,
// so assertions pin the exact code point.
const MINUS = "\u2212";

describe("formatNumber", () => {
  it("formats zero with Persian digits and no minus sign", () => {
    expect(formatNumber(0)).toBe("۰");
  });

  it("formats positive values with Persian digits and no ASCII digits", () => {
    expect(formatNumber(1234)).toBe("۱٬۲۳۴");
    expect(formatNumber(1234)).not.toMatch(/\d/);
  });

  it("groups large positive values with the Persian thousands separator", () => {
    expect(formatNumber(2500000)).toBe("۲٬۵۰۰٬۰۰۰");
  });

  it("formats negative values with a leading U+2212 minus and Persian digits", () => {
    expect(formatNumber(-1234)).toBe(`${MINUS}۱٬۲۳۴`);
    expect(formatNumber(-1234)).not.toContain("-");
    expect(formatNumber(-2500000)).toBe(`${MINUS}۲٬۵۰۰٬۰۰۰`);
  });
});

describe("formatToman", () => {
  it("formats zero with no minus sign", () => {
    expect(formatToman(0)).toBe("۰ تومان");
  });

  it("formats positive amounts in Persian digits with the تومان suffix", () => {
    expect(formatToman(2500000)).toBe("۲٬۵۰۰٬۰۰۰ تومان");
    expect(formatToman(1234)).toBe("۱٬۲۳۴ تومان");
  });

  it("formats negative amounts with a leading U+2212 minus", () => {
    expect(formatToman(-1500)).toBe(`${MINUS}۱٬۵۰۰ تومان`);
    expect(formatToman(-1500)).not.toContain("-");
  });

  it("omits the currency suffix when withCurrency is false", () => {
    expect(formatToman(1234, false)).toBe("۱٬۲۳۴");
  });
});

describe("formatCompactToman", () => {
  it("formats zero and sub-thousand values with full formatting", () => {
    expect(formatCompactToman(0)).toBe("۰ تومان");
    expect(formatCompactToman(999)).toBe("۹۹۹ تومان");
  });

  it("rounds thousand-range values to the nearest هزار", () => {
    expect(formatCompactToman(1000)).toBe("۱ هزار تومان");
    expect(formatCompactToman(1234)).toBe("۱ هزار تومان");
    expect(formatCompactToman(1999)).toBe("۲ هزار تومان");
  });

  it("rolls over to میلیون instead of ۱٬۰۰۰ هزار at the rounding boundary", () => {
    expect(formatCompactToman(999499)).toBe("۹۹۹ هزار تومان");
    expect(formatCompactToman(999500)).toBe("۱ میلیون تومان");
    expect(formatCompactToman(999999)).toBe("۱ میلیون تومان");
  });

  it("formats exact millions without a decimal", () => {
    expect(formatCompactToman(1000000)).toBe("۱ میلیون تومان");
    expect(formatCompactToman(4000000)).toBe("۴ میلیون تومان");
  });

  it("rounds non-exact millions to one decimal with a Persian decimal separator", () => {
    expect(formatCompactToman(2500000)).toBe("۲٫۵ میلیون تومان");
    expect(formatCompactToman(1870565)).toBe("۱٫۹ میلیون تومان");
    expect(formatCompactToman(1040000)).toBe("۱٫۰ میلیون تومان");
  });

  it("formats negative amounts with a leading U+2212 minus", () => {
    expect(formatCompactToman(-1500000)).toBe(`${MINUS}۱٫۵ میلیون تومان`);
    expect(formatCompactToman(-1200)).toBe(`${MINUS}۱ هزار تومان`);
    expect(formatCompactToman(-1500000)).not.toContain("-");
  });

  it("never emits ASCII digits", () => {
    expect(formatCompactToman(1234567)).not.toMatch(/\d/);
    expect(formatCompactToman(999)).not.toMatch(/\d/);
  });
});

describe("formatSignedToman", () => {
  it("prefixes positive amounts with +", () => {
    expect(formatSignedToman(2500000)).toBe("+۲٬۵۰۰٬۰۰۰ تومان");
    expect(formatSignedToman(1234)).toBe("+۱٬۲۳۴ تومان");
  });

  it("prefixes negative amounts with a leading U+2212 minus", () => {
    expect(formatSignedToman(-1500000)).toBe(`${MINUS}۱٬۵۰۰٬۰۰۰ تومان`);
    expect(formatSignedToman(-1500)).toBe(`${MINUS}۱٬۵۰۰ تومان`);
    expect(formatSignedToman(-1500)).not.toContain("-");
  });

  it("formats zero with no sign", () => {
    expect(formatSignedToman(0)).toBe("۰ تومان");
    expect(formatSignedToman(0)).not.toContain("+");
    expect(formatSignedToman(0)).not.toContain(MINUS);
  });

  it("never emits ASCII digits", () => {
    expect(formatSignedToman(2500000)).not.toMatch(/\d/);
    expect(formatSignedToman(-2500000)).not.toMatch(/\d/);
  });
});

describe("formatPercent", () => {
  it("formats whole ratios with Persian digits and the Persian percent sign", () => {
    expect(formatPercent(0)).toBe("۰٪");
    expect(formatPercent(0.85)).toBe("۸۵٪");
    expect(formatPercent(1)).toBe("۱۰۰٪");
  });

  it("rounds fractional percents to the nearest whole number", () => {
    expect(formatPercent(0.15344)).toBe("۱۵٪");
    expect(formatPercent(0.155)).toBe("۱۶٪");
    expect(formatPercent(1.5344)).toBe("۱۵۳٪");
  });

  it("never emits decimals or ASCII digits", () => {
    expect(formatPercent(0.1234)).toBe("۱۲٪");
    expect(formatPercent(0.1234)).not.toMatch(/\d/);
    expect(formatPercent(0.1234)).not.toContain("٫");
  });
});
