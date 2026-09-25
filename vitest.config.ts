import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Playwright specs live in e2e/ and run via `npm run e2e`, not vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  // tsconfig has "jsx": "preserve" (Next.js handles the transform). Vite 8's
  // oxc transform honors that setting, so override it here to let tests
  // transform JSX themselves. Only 'preserve' is accepted as a string literal
  // in the oxc types, so use the object form to force the automatic runtime.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
