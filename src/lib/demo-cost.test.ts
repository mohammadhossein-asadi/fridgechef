import { describe, expect, it } from "vitest";
import { generateWeeklyPlan } from "./ai/planner";
import { DEMO_RECIPE_MAP } from "./demo";
import { findIngredient, INGREDIENTS } from "./ingredients";
import { PlannerRequestSchema } from "./schemas";
import type { MealSlot } from "./schemas";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

function makeRequest() {
  return PlannerRequestSchema.parse({
    budgetToman: 8_000_000,
    people: 4,
    days: 7,
    slots: SLOTS,
  });
}

const req = makeRequest();
const { plan, mode } = await generateWeeklyPlan(req, "demo");

describe("demo weekly plan cost", () => {

  it("runs in demo mode without any AI provider", () => {
    expect(mode).toBe("demo");
    expect(plan.people).toBe(4);
    expect(plan.days).toHaveLength(7);
  });

  it("fills every requested slot on every day with a known demo recipe", () => {
    const seenRecipeIds = new Set<string>();

    for (const day of plan.days) {
      const slots = day.meals.map((m) => m.slot);
      for (const slot of SLOTS) {
        expect(slots, `day ${day.date} missing slot ${slot}`).toContain(slot);
      }

      for (const meal of day.meals) {
        const recipe = DEMO_RECIPE_MAP[meal.recipeId];
        expect(recipe, `unknown demo recipe id "${meal.recipeId}"`).toBeDefined();
        expect(recipe.ingredients.length).toBeGreaterThan(0);
        seenRecipeIds.add(meal.recipeId);
      }
    }

    // The planner should actually rotate through the demo pool, not repeat one recipe.
    expect(seenRecipeIds.size).toBeGreaterThan(1);
  });

  it("references only ingredients that exist in ingredients.ts", () => {
    const knownIds = new Set(INGREDIENTS.map((i) => i.id));
    const unknown = new Map<string, string>();

    for (const recipe of Object.values(DEMO_RECIPE_MAP)) {
      for (const line of recipe.ingredients) {
        if (!knownIds.has(line.id)) {
          unknown.set(line.id, recipe.id);
        }
      }
    }

    expect([...unknown.entries()]).toEqual([]);
  });

  it("gives every referenced ingredient a positive, finite Toman price", () => {
    for (const recipe of Object.values(DEMO_RECIPE_MAP)) {
      for (const line of recipe.ingredients) {
        const def = findIngredient(line.id);
        expect(def, `no ingredient definition for "${line.id}" (${recipe.id})`).toBeDefined();
        if (def) {
          expect(
            Number.isFinite(def.pricePerUnit) && def.pricePerUnit > 0,
            `non-positive or non-finite Toman price for "${def.id}" (${recipe.id})`,
          ).toBe(true);
        }
      }
    }
  });

  it("estimates a total weekly cost inside a sane range", () => {
    const { estimatedCostToman } = plan.totals;
    // A week of 3 meals a day for 4 people must cost something real…
    expect(estimatedCostToman).toBeGreaterThan(0);
    // …but the demo data uses approximate prices, so it must stay far below the budget.
    expect(estimatedCostToman).toBeLessThan(30_000_000);
  });

  it("matches the totals against the shopping line items", () => {
    const shoppingSum = plan.shopping.reduce((sum, item) => sum + item.estimatedPriceToman, 0);
    expect(shoppingSum).toBe(plan.totals.estimatedCostToman);
    expect(plan.totals.remainingToman).toBe(req.budgetToman - plan.totals.estimatedCostToman);
  });
});
