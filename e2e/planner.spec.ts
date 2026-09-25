import { test, expect, type Page } from "@playwright/test";

const STORE_KEY = "sofreh-store";

type StoredState = {
  state: {
    plan?: unknown[];
    planMeta?: { mode?: string } | null;
  };
};

async function readStoredState(page: Page): Promise<StoredState> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error(`localStorage[${key}] is empty`);
    return JSON.parse(raw) as StoredState;
  }, STORE_KEY);
}

test.describe("planner flow", () => {
  test("picks 5 days, generates a demo plan, persists it and survives a reload", async ({ page }) => {
    // ── Step 0: landing on the wizard ───────────────────────────────
    await page.goto("/planner");
    await expect(page.getByRole("heading", { name: "برنامه‌ریزی غذای هفتگی" })).toBeVisible();

    // ── Step 0 → 1: pantry step is skippable ───────────────────────
    await page.getByRole("button", { name: "مرحله بعد" }).click();

    // ── Step 1: pick days ───────────────────────────────────────────
    // Day buttons render via toPersianDigits, so "5" → "۵ روز".
    // (These are plain <button>s with no aria-pressed; the selected state
    // is reflected in the `bg-saffron-500` class.)
    const dayFive = page.getByRole("button", { name: "۵ روز" });
    await dayFive.click();
    await expect(dayFive).toHaveClass(/bg-saffron-500/);

    // Budget defaults to a valid value; people default to 4 — both fine.
    await page.getByRole("button", { name: "مرحله بعد" }).click();

    // ── Step 2: meal slots ──────────────────────────────────────────
    // Lunch & dinner are pre-selected by default, so no interaction needed.
    await page.getByRole("button", { name: "مرحله بعد" }).click();

    // ── Step 3: plan mode + generate ────────────────────────────────
    // The demo mode radio is checked by default, so no interaction needed.
    const demoRadio = page.getByRole("radio", { name: /نسخهٔ آماده/ });
    await expect(demoRadio).toHaveAttribute("aria-checked", "true");

    // The demo generator enforces a ~9s minimum duration, and the dev
    // server compiles routes on first hit — allow a generous timeout for
    // the plan page to appear.
    await page.getByRole("button", { name: /ساخت برنامه هفتگی/ }).click();
    await expect(
      page.getByRole("heading", { name: "برنامه هفتگی" }),
    ).toBeVisible({ timeout: 90_000 });

    // Demo-mode badge confirms the deterministic path was taken.
    await expect(page.getByText("حالت نمایشی", { exact: true })).toBeVisible();

    // Budget progress bar is present.
    await expect(
      page.getByRole("progressbar", { name: "مصرف بودجه" }),
    ).toBeVisible();

    // A 5-day plan renders exactly 5 day sections.
    const daySections = page.locator("section[aria-label^='برنامه ']");
    await expect(daySections).toHaveCount(5);

    // At least one recipe card is rendered.
    await expect(page.locator("article h3").first()).toBeVisible();

    // ── Persistence: plan is saved in localStorage ──────────────────
    const stored = await readStoredState(page);
    expect(stored.state.plan, "stored plan should be a non-empty array").toBeTruthy();
    expect(Array.isArray(stored.state.plan)).toBe(true);
    expect(stored.state.plan!.length).toBe(5);
    expect(stored.state.planMeta?.mode).toBe("demo");

    // ── Reload: plan reappears from localStorage ────────────────────
    await page.reload();
    await expect(page.getByRole("heading", { name: "برنامه هفتگی" })).toBeVisible();
    await expect(page.getByText("حالت نمایشی", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "مصرف بودجه" }),
    ).toBeVisible();

    const daySectionsAfterReload = page.locator("section[aria-label^='برنامه ']");
    await expect(daySectionsAfterReload).toHaveCount(5);
    await expect(daySectionsAfterReload.first().locator("h3").first()).toBeVisible();
  });

  test("plan page shows the empty state before any plan exists", async ({ page }) => {
    // Start from a clean slate so the test is deterministic.
    await page.goto("/planner");
    await page.evaluate((key) => localStorage.removeItem(key), STORE_KEY);

    await page.goto("/plan");
    await expect(page.getByRole("heading", { name: "هنوز برنامه‌ای نساخته‌ای" })).toBeVisible();
  });
});
