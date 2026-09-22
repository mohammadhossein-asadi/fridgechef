/**
 * AI weekly planning with Zod-validated Persian JSON output.
 * Invalid AI output never reaches the UI — we fall back to demo recipes.
 * All arithmetic is done by the deterministic budget engine.
 */
import { z } from "zod";
import { chatCompletion, extractJson, isAiConfigured } from "./provider";
import {
  PlannerRequest,
  Recipe,
  RecipeSchema,
  WeeklyPlan,
  MealSlot,
  MealSlotLabels,
  DayPlan,
  PlanMeal,
} from "../schemas";
import { DEMO_RECIPES, DEMO_RECIPE_MAP } from "../demo";
import { buildShoppingList, computeTotals, sortShopping } from "../budget";
import { nextIranianWeekStart } from "../dates";

/** The shape AI returns: meals per day; costs are computed by us. */
const AiPlanSchema = z.object({
  days: z
    .array(
      z.object({
        meals: z.array(
          z.object({
            slot: z.enum(["breakfast", "lunch", "dinner", "snack"]),
            isLeftoverOf: z.string().nullable().default(null),
            recipe: RecipeSchema,
          }),
        ),
      }),
    )
    .min(1),
});

export interface PlanResult {
  plan: WeeklyPlan;
  mode: "ai" | "demo";
}

export async function generateWeeklyPlan(
  req: PlannerRequest,
  requestedMode?: "ai" | "demo" | null,
): Promise<PlanResult> {
  const recipesById: Record<string, Recipe> = { ...DEMO_RECIPE_MAP };
  let aiDays: { meals: PlanMeal[] }[] | null = null;

  const wantAi = requestedMode === null ? isAiConfigured() : requestedMode === "ai";

  if (wantAi) {
    try {
      const response = await chatCompletion(
        [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(req) },
        ],
        { temperature: 0.7, maxTokens: 8000, output: "json" },
      );
      const parsed = AiPlanSchema.safeParse(extractJson(response));
      if (parsed.success) {
        aiDays = parsed.data.days.map((day) => ({
          meals: day.meals.map((meal) => {
            recipesById[meal.recipe.id] = meal.recipe;
            return {
              slot: meal.slot,
              recipeId: meal.recipe.id,
              isLeftoverOf: meal.isLeftoverOf,
            };
          }),
        }));
      }
      // on parse failure we fall through to demo
    } catch {
      // fall through to demo
    }
  }

  const mode: "ai" | "demo" = aiDays ? "ai" : "demo";
  const days = buildDays(req, aiDays);

  const shopping = sortShopping(
    buildShoppingList(days, recipesById, req.people, req.pantry),
  );
  const totals = computeTotals(shopping, req.people, req.days, req.budgetToman);

  const plan: WeeklyPlan = {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    startDate: days[0]?.date ?? nextIranianWeekStart().toISOString(),
    people: req.people,
    budgetToman: req.budgetToman,
    days,
    shopping,
    totals,
    notes:
      mode === "demo"
        ? ["حالت نمایشی: دستورهای نمونه با قیمت تقریبی."]
        : [],
  };

  return { plan, mode };
}

/**
 * Turn AI days (or null in demo mode) into complete DayPlan objects.
 * Missing slots/days are filled from the demo pool so the plan is always complete.
 */
function buildDays(
  req: PlannerRequest,
  aiDays: { meals: PlanMeal[] }[] | null,
): DayPlan[] {
  const start = nextIranianWeekStart();
  const days: DayPlan[] = [];

  const breakfastPool = DEMO_RECIPES.filter((r) => r.mealTypes.includes("breakfast"));
  const lunchPool = DEMO_RECIPES.filter((r) => r.mealTypes.includes("lunch"));
  const dinnerPool = DEMO_RECIPES.filter((r) => r.mealTypes.includes("dinner"));

  const demoPoolFor = (slot: MealSlot, dayIndex: number): Recipe => {
    const pool =
      slot === "breakfast"
        ? breakfastPool.length
          ? breakfastPool
          : DEMO_RECIPES
        : slot === "lunch"
          ? lunchPool.length
            ? lunchPool
            : DEMO_RECIPES
          : slot === "dinner"
            ? dinnerPool.length
              ? dinnerPool
              : DEMO_RECIPES
            : DEMO_RECIPES;
    // Cost-sorted rotation: cheaper meals earlier in the week; per-slot offset
    // so the same recipe doesn't repeat across slots on the same day.
    const sorted = [...pool].sort(
      (a, b) => a.estimatedCostToman - b.estimatedCostToman,
    );
    const slotSeed = slot === "breakfast" ? 0 : slot === "lunch" ? 1 : slot === "dinner" ? 2 : 3;
    return sorted[(dayIndex + slotSeed) % sorted.length];
  };

  for (let i = 0; i < req.days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const meals: PlanMeal[] = [];

    for (const slot of req.slots) {
      const aiMeal = aiDays?.[i]?.meals.find((m) => m.slot === slot);
      if (aiMeal) {
        meals.push(aiMeal);
      } else {
        const recipe = demoPoolFor(slot, i);
        meals.push({ slot, recipeId: recipe.id, isLeftoverOf: null });
      }
    }

    days.push({ date: date.toISOString(), meals });
  }
  return days;
}

function buildSystemPrompt(): string {
  return `تو یک دستیار آشپزی و برنامه‌ریز غذای ایرانی هستی.
وظیفه تو ساخت برنامه غذایی هفتگی اقتصادی برای خانواده‌های ایرانی است.
قوانین:
- تمام متن‌ها باید فارسی روان و طبیعی باشد، نه ترجمه ماشینی.
- غذاها باید متناسب با فرهنگ غذایی ایران باشد (پلوها، خوراک‌ها، خورشت‌ها، صبحانه‌های ایرانی).
- از مواد اولیه‌ی رایج آشپزخانه ایرانی استفاده کن (پیاز، رب، زردچوبه، برنج، حبوبات...).
- حداکثر استفاده از مواد مشترک بین غذاها تا خرید اضافه نشود.
- برای بعضی شام‌ها می‌توانی «استفاده از غذای باقی‌مانده» پیشنهاد بدهی.
- هیچ عدد و محاسبه‌ای ننویس؛ هزینه‌ها در سیستم جداگانه محاسبه می‌شود.
- خروجی فقط و فقط JSON معتبر با ساختار خواسته‌شده باشد.`;
}

function buildUserPrompt(req: PlannerRequest): string {
  const slotNames = req.slots.map((s) => MealSlotLabels[s]).join("، ");
  return `یک برنامه غذایی ${req.days} روزه بساز.
بودجه هفتگی: ${req.budgetToman} تومان (تقریبی)
تعداد نفرات: ${req.people} نفر
وعده‌ها: ${slotNames}
سطح بودجه: ${req.tier}
${req.pantry.length ? `مواد موجود در خانه (نباید در لیست خرید بیایند): ${req.pantry.join("، ")}` : ""}
${req.liked.length ? `غذاهای مورد علاقه: ${req.liked.join("، ")}` : ""}
${req.disliked.length ? `غذاهای نامطلوب: ${req.disliked.join("، ")}` : ""}
${req.allergies.length ? `حساسیت‌ها: ${req.allergies.join("، ")}` : ""}
${req.region ? `سبک آشپزی منطقه‌ای: ${req.region}` : ""}

ساختار JSON خروجی:
{
  "days": [
    { "meals": [
      { "slot": "lunch", "isLeftoverOf": null, "recipe": {
        "id": "adas-polo",
        "name": "عدس‌پلو",
        "description": "...",
        "prepMinutes": 20,
        "cookMinutes": 60,
        "servings": ${req.people},
        "ingredients": [{ "id": "rice", "name": "برنج", "unit": "kilogram", "qty": 2 }],
        "steps": ["...", "..."],
        "tips": "...",
        "substitutions": ["..."],
        "tags": ["پلو"],
        "mealTypes": ["lunch"],
        "isLeftover": false,
        "estimatedCostToman": 0,
        "difficulty": "آسان",
        "emoji": "🍚"
      } }
    ] }
  ]
}
نکات: id دستورپخت باید ثابت و لاتین باشد. ingredient.id از این فهرست انتخاب کن: rice, bread, pasta, flour, onion, potato, tomato, cucumber, eggplant, bell_pepper, carrot, spinach, herbs, garlic, lemon, pomegranate, apple, egg, chicken, ground_beef, lamb_shank, soy_protein, milk, yogurt, cheese, butter, kashek, lentil, bean, chickpea, green_pea, barberry, saffron, turmeric, tomato_paste, oil, dried_lime, sumac, advieh, sugar, tea, walnut, raisin, date.
unit یکی از: gram, kilogram, milliliter, liter, count, package, tablespoon, teaspoon, cup, glass, shotan, bunch, clove, can, slice.
estimatedCostToman را صفر بگذار؛ سیستم خودش حساب می‌کند.`;
}
