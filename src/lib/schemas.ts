import { z } from "zod";

/** Normalize Persian/Arabic YEH/KAF and ZWNJ for consistent comparisons */
export function normalizeFa(s: string): string {
  return s
    .trim()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export const IngredientLineSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string().default("count"),
  qty: z.number().positive(),
});

export type IngredientLine = z.infer<typeof IngredientLineSchema>;

export const MealSlotSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
export type MealSlot = z.infer<typeof MealSlotSchema>;

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  prepMinutes: z.number().int().min(0).max(600),
  cookMinutes: z.number().int().min(0).max(600),
  servings: z.number().int().min(1).max(24),
  ingredients: z.array(IngredientLineSchema).min(1),
  steps: z.array(z.string()).min(1),
  tips: z.string().default(""),
  substitutions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mealTypes: z.array(MealSlotSchema).default([]),
  isLeftover: z.boolean().default(false),
  estimatedCostToman: z.number().min(0),
  difficulty: z.enum(["آسان", "متوسط", "سخت"]).default("آسان"),
  emoji: z.string().default("🍲"),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const PlanMealSchema = z.object({
  slot: MealSlotSchema,
  recipeId: z.string(),
  isLeftoverOf: z.string().nullable().default(null),
});

export type PlanMeal = z.infer<typeof PlanMealSchema>;

export const DayPlanSchema = z.object({
  date: z.string(), // ISO yyyy-mm-dd
  meals: z.array(PlanMealSchema).default([]),
});

export type DayPlan = z.infer<typeof DayPlanSchema>;

export const ShoppingCategorySchema = z.enum([
  "produce",
  "protein",
  "dairy",
  "legumes",
  "grains",
  "spices",
  "other",
]);

export type ShoppingCategory = z.infer<typeof ShoppingCategorySchema>;

export const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number().positive(),
  unit: z.string(),
  category: ShoppingCategorySchema,
  estimatedPriceToman: z.number().min(0),
  checked: z.boolean().default(false),
});

export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

export const WeeklyPlanSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  startDate: z.string(),
  people: z.number().int().min(1).max(20),
  budgetToman: z.number().min(0),
  days: z.array(DayPlanSchema),
  shopping: z.array(ShoppingItemSchema),
  totals: z.object({
    estimatedCostToman: z.number(),
    perPersonToman: z.number(),
    perDayToman: z.number(),
    remainingToman: z.number(),
  }),
  notes: z.array(z.string()).default([]),
});

export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;

export const PlannerRequestSchema = z.object({
  budgetToman: z.number().min(100_000),
  people: z.number().int().min(1).max(20),
  days: z.number().int().min(1).max(7).default(7),
  slots: z.array(MealSlotSchema).min(1),
  pantry: z.array(z.string()).default([]),
  liked: z.array(z.string()).default([]),
  disliked: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  region: z.string().nullable().default(null),
  tier: z.enum(["اقتصادی", "متعادل", "منعطف"]).default("متعادل"),
  city: z.string().nullable().default(null),
  requestedMode: z.enum(["ai", "demo"]).nullable().default(null),
});

export type PlannerRequest = z.infer<typeof PlannerRequestSchema>;

export const MealSlotLabels: Record<MealSlot, string> = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
  snack: "میان‌وعده",
};
