import { NextResponse } from "next/server";
import { PlannerRequestSchema } from "@/lib/schemas";
import { generateWeeklyPlan } from "@/lib/ai/planner";
import { isAiConfigured } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "درخواست نامعتبر است." },
      { status: 400 },
    );
  }

  const parsed = PlannerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "اطلاعات برنامه‌ریزی کامل نیست.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const { plan, mode } = await generateWeeklyPlan(
      parsed.data,
      parsed.data.requestedMode,
    );
    return NextResponse.json({ plan, mode, aiConfigured: isAiConfigured() });
  } catch (err) {
    console.error("plan generation failed:", err);
    return NextResponse.json(
      { error: "ساخت برنامه با خطا مواجه شد. لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
