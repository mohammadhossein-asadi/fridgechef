/**
 * Deterministic budget engine.
 * AI never does arithmetic — this module owns all money math.
 */
import type { ShoppingItem, Recipe, DayPlan } from "./schemas";
import { estimateIngredientCost, findIngredient } from "./ingredients";

/** Scale a recipe's estimated cost to a target number of servings. */
export function recipeCostForServings(recipe: Recipe, servings: number): number {
  const factor = servings / recipe.servings;
  return Math.round(
    recipe.ingredients.reduce(
      (sum, line) =>
        sum + estimateIngredientCost(line.id, line.qty * factor, line.unit),
      0,
    ),
  );
}

interface AggItem {
  name: string;
  qty: number;
  unit: string;
  category: ShoppingItem["category"];
  total: number;
}

/**
 * Aggregate plan ingredients into a merged shopping list.
 * Quantities are only merged when units match; otherwise the first unit wins
 * and costs are always summed so totals stay correct.
 */
export function buildShoppingList(
  days: DayPlan[],
  recipes: Record<string, Recipe>,
  servings: number,
  pantry: string[],
): ShoppingItem[] {
  const pantryNorm = new Set(pantry.map((p) => p.toLowerCase().trim()));
  const agg = new Map<string, AggItem>();

  for (const day of days) {
    for (const meal of day.meals) {
      if (meal.isLeftoverOf) continue;
      const recipe = recipes[meal.recipeId];
      if (!recipe) continue;
      const factor = servings / recipe.servings;
      for (const line of recipe.ingredients) {
        if (pantryNorm.has(line.id) || pantryNorm.has(line.name.toLowerCase().trim())) {
          continue;
        }
        const qty = line.qty * factor;
        const ing = findIngredient(line.id);
        const item = agg.get(line.id) ?? {
          name: line.name,
          qty: 0,
          unit: line.unit,
          category: (ing?.category ?? "other") as ShoppingItem["category"],
          total: 0,
        };
        if (item.unit === line.unit) {
          item.qty += qty;
        }
        item.total += estimateIngredientCost(line.id, qty, line.unit);
        agg.set(line.id, item);
      }
    }
  }

  return Array.from(agg.entries()).map(([id, item]) => ({
    id,
    name: item.name,
    qty: Math.round(item.qty * 100) / 100,
    unit: item.unit,
    category: item.category,
    estimatedPriceToman: Math.round(item.total),
    checked: false,
  }));
}

export interface PlanTotals {
  estimatedCostToman: number;
  perPersonToman: number;
  perDayToman: number;
  remainingToman: number;
}

/** Deterministic totals for a plan + its shopping list. */
export function computeTotals(
  shopping: ShoppingItem[],
  people: number,
  daysCount: number,
  budgetToman: number,
): PlanTotals {
  const estimatedCostToman = shopping.reduce(
    (sum, item) => sum + item.estimatedPriceToman,
    0,
  );
  return {
    estimatedCostToman,
    perPersonToman: people > 0 ? Math.round(estimatedCostToman / people) : 0,
    perDayToman: daysCount > 0 ? Math.round(estimatedCostToman / daysCount) : 0,
    remainingToman: budgetToman - estimatedCostToman,
  };
}

const CATEGORY_ORDER: ShoppingItem["category"][] = [
  "produce",
  "protein",
  "dairy",
  "legumes",
  "grains",
  "spices",
  "other",
];

export function sortShopping(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.name.localeCompare(b.name, "fa"),
  );
}
