# 🍳 FridgeChef — Smart Weekly Meal Planner

> Generate a grocery list and weekly menu (from 70+ Persian ingredients) from what's already in your fridge.
> **Persian-first** and **RTL**, with a **dark/light** theme and a **Jalali (Shamsi) calendar** — built with **Next.js (App Router)** and **TypeScript**.
> No heavy, opinionated dependencies. Runs in **Demo Mode** out of the box and upgrades to any OpenAI-compatible AI.

> [!TIP]
> Want screenshots in the README? Drop PNGs into a `docs/` folder and point the `<img>` tags at them — see the "Screenshots" section at the bottom.

---

## 📖 Table of Contents

- [Features](#features)
- [Why FridgeChef](#why-fridgechef)
- [How it Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [AI Providers](#ai-providers)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Modules](#key-modules)
- [Scripts](#scripts)
- [FAQ](#faq)
- [Roadmap](#roadmap)

---

## ✨ Features

- **🧠 Recipe from what you have** — Enter the ingredients you own, and FridgeChef suggests dishes.
- **🗓️ Weekly meal planning** — A full week plan, automatically split into **breakfast, lunch, and dinner** slots.
- **🛒 Auto grocery list** — Aggregates every ingredient across the plan into a single shopping list.
- **🔗 Recipe → Ingredients** — Click any dish to jump to its full ingredient list and details.
- **📅 Jalali calendar** — All dates are displayed and computed in the **Shamsi (Jalali)** calendar.
- **🌗 Light / Dark theme** — Full theming with system-preference detection (`next-themes`).
- **🇮🇷 Persian-first (RTL)** — UI, labels, and date formatting are built around Persian from the ground up.
- **🖥️ Landing experience** — An animated landing page with a 3D scene.
- **🎨 Modern UI** — Glassmorphism cards, gradient headers, scroll animations, and responsive layouts.
- **🔒 Type-safe end-to-end** — Zod schemas guard every boundary, from the form to the AI response.

---

## 💡 Why FridgeChef

- **Reduces food waste** by turning leftover ingredients into concrete meals.
- **Saves time** — no more "what's for dinner?" guessing.
- **Persian-oriented** — tailored to Persian ingredients, portion logic, and the Jalali calendar.
- **Lightweight** — minimal dependencies, fast, and easy to run locally with **no API key required** (Demo Mode).
- **Flexible AI** — plug in DeepSeek, Google Gemini, OpenAI, Groq, Mistral, OpenRouter, GLM, or any OpenAI-compatible endpoint.

---

## 🔁 How it Works

1. **Explore** the recipe and ingredient libraries on the landing and browse pages.
2. **Fill in the form** — the ingredients you already have, plus any allergies/dietary preferences.
3. **FridgeChef plans** — it suggests a weekly menu tailored to what you have.
   - Without an API key, a **deterministic planner** (`src/lib/ai/planner.ts`) generates the plan locally.
   - With an API key, an **LLM** plans from your ingredients and the system prompt enforces valid JSON.
4. **Review the plan** — see the day-by-day, meal-by-meal breakdown.
5. **Get the grocery list** — the AI also returns a consolidated shopping list of what you need.
6. **See the recipes** — tap any dish to view its full ingredient breakdown.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (Node 20+ recommended)
- npm, pnpm, yarn, or bun — pick one and use it consistently

### 1. Clone the repo

```bash
git clone https://github.com/your-org/fridgechef.git
cd fridgechef
```

### 2. Install dependencies

```bash
npm install
# or: pnpm install  |  yarn  |  bun install
```

### 3. Configure environment (optional)

```bash
cp .env.example .env.local
```

Edit `.env.local` and add at least one provider key. See [AI Providers](#ai-providers) for the full list.

> **No key needed** — if you leave everything empty, the app runs in **Demo Mode** with built-in Persian sample data.

### 4. Run the development server

```bash
npm run dev
```

Then open **http://localhost:3000**.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local`. All values are **optional** — with none set, Demo Mode is active.

| Variable | Description | Example |
| --- | --- | --- |
| `AI_PROVIDER` | Optional provider hint. Left blank for auto-detection across all configured keys. | `DeepSeek` |
| `AI_API_KEY` | Generic API key (any provider's key works when using the generic fallback). | `sk-…` |
| `AI_MODEL` | Model name for the generic key (`AI_API_KEY`). | `deepseek-chat` |
| `AI_BASE_URL` | Endpoint for the generic key (`AI_API_KEY`). | `https://api.deepseek.com/v1` |
| `GROQ_API_KEY` / `GROQ_MODEL` | Groq provider | `llama-3.3-70b-versatile` |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | OpenRouter (also accepts `GLM_API_KEY`, `HF_GLM_API_KEY`) | `meta-llama/llama-3.1-8b-instant` |
| `MISTRAL_API_KEY` / `MISTRAL_MODEL` | Mistral provider | `mistral-small-latest` |
| `HF_DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` | DeepSeek via the DeepSeek endpoint | `deepseek-chat` |
| `GLM_API_KEY` (must start with `sk-`) / `GL_MODEL` | GLM / Zhipu (bigmodel) | `glm-4-flash` |
| `OPENAI_API_KEY` (also `OPENAI_API_KEY_1/2/3`) / `OPENAI_MODEL` | OpenAI provider | `gpt-4o-mini` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Google Gemini via OpenAI-compatible endpoint | `gemini-2.0-flash` |

**Auto-failover:** FridgeChef tries every configured provider in order (Groq → OpenRouter → Mistral → DeepSeek → GLM → OpenAI → Gemini) until one succeeds, so a single expired key won't break the app.

---

## 📁 Project Structure

```
fridgechef/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # Root layout (direction, fonts, theme)
│  │  ├─ page.tsx                # Landing page
│  │  ├─ (app)/
│  │  │  ├─ layout.tsx           # App shell (mobile nav)
│  │  │  ├─ planning-form       # The meal-planning form
│  │  │  ├─ recipes              # Recipe browser
│  │  │  ├─ ingredients          # Ingredient browser
│  │  │  └─ plan                  # Weekly plan + grocery list
│  │  ├─ api/plan/route.ts       # API route: orchestrates planning
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ ui/                     # Theme provider, form primitives, icons
│  │  ├─ recipes/                # Recipe cards & details
│  │  ├─ ingredients/            # Ingredient cards
│  │  ├─ 3d/                     # Landing 3D scene
│  │  └─ landing/                # Hero, scroll story
│  ├─ lib/
│  │  ├─ ai/                    # AI glue (schema, provider, planner, types)
│  │  ├─ ingredients.ts         # Persian ingredient catalog
│  │  ├─ dates.ts               # Jalali calendar helpers
│  │  ├─ budget.ts              # Budget / portion helpers
│  │  ├─ format.ts              # Number & date formatting
│  │  ├─ units.ts               # Unit conversions
│  │  ├─ schemas.ts             # Zod validation schemas
│  │  ├─ store.ts               # Zustand state (theme, selection, plan)
│  │  └─ demo.ts                # Demo/sample meal data
│  ├─ motion/                    # Reusable animations
│  └─ data/                      # Static seed data (e.g. Persian city names)
├─ package.json
├─ tsconfig.json
├─ next.config.ts
└─ tailwind.config.ts
```

---

## 🤖 AI Providers

FridgeChef is **model-agnostic** and uses any **OpenAI-compatible** chat endpoint. Configuration lives in [`src/lib/ai/provider.ts`](src/lib/ai/provider.ts).

The system prompt turns the LLM into an expert home chef:

> *"You are an expert home chef. Create recipes from the ingredients the user already has. Use only listed ingredients (plus common pantry staples like water, salt, pepper, oil, and butter). Reply only with valid JSON matching the schema."*

Supported providers (auto-detected from your environment variables):

| Provider | Env key(s) | Default model |
| --- | --- | --- |
| **Groq** | `GROQ_API_KEY` | `llama-3.3-70b-versatile` |
| **OpenRouter** | `OPENROUTER_API_KEY` / `GLM_API_KEY` / `HF_GLM_API_KEY` | `meta-llama/llama-3.1-8b-instant` |
| **Mistral** | `MISTRAL_API_KEY` | `mistral-small-latest` |
| **DeepSeek** | `HF_DEEPSEEK_API_KEY` | `deepseek-chat` |
| **GLM** (Zhipu/bigmodel) | `GLM_API_KEY` (sk-*) | `glm-4-flash` |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o-mini` |
| **Gemini** | `GEMINI_API_KEY` | `gemini-2.0-flash` |

> **OpenAI-compatible:** any endpoint that speaks the `/chat/completions` API works — just add your own key and model.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, TypeScript 5.x |
| **Styling** | Tailwind CSS v4, CSS variables for theming |
| **Animation** | `motion` (Framer Motion v13), Three.js / R3F for the 3D scene |
| **State** | Zustand |
| **Validation** | Zod (all form & API boundaries) |
| **Theming** | next-themes (light/dark + system preference) |
| **Calendar** | jalaali-js (Shamsi/Jalali dates) |
| **Icons** | Inline SVG components in `src/components/ui` |
| **Language** | TypeScript with `strict: true` |

### Data flow

```
PlanningForm ──► app/api/plan (route)
                       │
        ┌──────────────┴───────────────┐
        ▼                               ▼
  LLM (provider.ts)          Deterministic planner.ts
        │                               │
        └──────────────► result.json ──┘
                       │  (Zod-validated)
                       ▼
             Plan View + Grocery List
                       │
                       ▼
                Recipe Details
```

---

## 🧩 Key Modules

- **[`src/lib/ai/provider.ts`](src/lib/ai/provider.ts)** — Configures AI providers in priority order, sends chat requests with **auto-failover**, and extracts JSON from free-form LLM text (`extractJson`).
- **[`src/lib/ai/planner.ts`](src/lib/ai/planner.ts)** — Deterministic planning engine used in **Demo Mode** (no API key). Builds a balanced weekly plan and grocery list from `demo.ts`.
- **[`src/lib/ai/schema.ts`](src/lib/ai/schema.ts)** — Zod schemas for the weekly plan and grocery list responses.
- **[`src/lib/ai/types.ts`](src/lib/ai/types.ts)** — Shared TypeScript types.
- **[`src/app/api/plan/route.ts`](src/app/api/plan/route.ts)** — API route that coordinates the LLM (or fallback) into a final plan + shopping list.
- **[`src/lib/ingredients.ts`](src/lib/ingredients.ts)** — The Persian ingredient catalog (70+ items).
- **[`src/lib/dates.ts`](src/lib/dates.ts)** — Jalali/Shamsi calendar helpers.
- **[`src/lib/schemas.ts`](src/lib/schemas.ts)** — Zod schemas for form inputs.
- **[`src/lib/store.ts`](src/lib/store.ts)** — Zustand store (theme, selections, plan state).
- **[`src/lib/budget.ts`](src/lib/budget.ts)** — Portion and budget helpers.

---

## 📦 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check the project (`tsc --noEmit`) |
| `npm run format` | Format code with Prettier |

---

## ❓ FAQ

**Q: Do I need an API key to use FridgeChef?**
No. Without a key it runs in **Demo Mode** using the deterministic planner and sample data. Add a key to enable real LLM planning.

**Q: Which providers are supported?**
Any OpenAI-compatible endpoint — DeepSeek, Google Gemini, OpenAI, Groq, Mistral, OpenRouter, GLM, and more. See [AI Providers](#ai-providers).

**Q: Does it support English / LTR?**
The app is **Persian-first with a fixed RTL layout** (the Persian UI and Jalali dates are built-in). Theming supports light/dark. Language switching (en/fa) is on the roadmap — see [Roadmap](#roadmap).

**Q: How is data stored?**
FridgeChef is stateless — it generates plans on the fly and doesn't persist data between sessions.

---

## 🗺️ Roadmap

- [ ] **Bilingual UI** (Persian + English) with true RTL/LTR switching and a locale store.
- [ ] Expanded ingredient & recipe coverage across Iranian regions.
- [ ] Meal preferences: cuisine, calorie targets, and budget sliders.
- [ ] Per-recipe serving size adjustments with live re-aggregation of the grocery list.
- [ ] Export to PDF / shareable meal plan links.
- [ ] Persisted history and favorite recipes.

---

## 📸 Screenshots

> Add your screenshots to a `docs/` directory and uncomment/point the tags below, e.g.:

```html
<p align="center">
  <img src="docs/hero.png" alt="FridgeChef landing" width="100%" />
</p>
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo and create a feature branch.
2. Keep changes type-safe and follow the existing style (`npm run lint && npm run typecheck`).
3. Open a pull request describing the motivation behind the change.

---

## 📄 License

MIT
