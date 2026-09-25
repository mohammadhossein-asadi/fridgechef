import { defineConfig } from "@playwright/test";

/**
 * E2E setup notes:
 * - Uses the locally installed Microsoft Edge via `channel: "msedge"` so we
 *   don't need to download Playwright's own Chromium build.
 * - Boots the Next.js dev server itself; an already-running server on port
 *   3000 is reused when not on CI.
 * - The demo plan generator enforces a ~9s minimum "thinking" duration, so
 *   assertion timeouts are tuned accordingly.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 35_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    browserName: "chromium",
    channel: "msedge",
    baseURL: "http://localhost:3000",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "edge",
      use: { browserName: "chromium", channel: "msedge" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
