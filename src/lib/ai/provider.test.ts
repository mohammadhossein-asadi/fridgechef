import { afterEach, describe, expect, it } from "vitest";

/**
 * Regression test for `ReferenceError: process is not defined` at
 * `buildConfigList` (provider.ts).
 *
 * The provider module is imported by the planner wizard, a client component,
 * so its client-facing entry points must work in a browser-like environment
 * where the Node `process` global does not exist. The crash was at *call*
 * time (`isAiConfigured()` → `getAiConfigurations()` → `buildConfigList()`
 * reading `process.env`), so the browser-like window here is a synchronous
 * delete-call-restore block: no microtask turns elapse while `process` is
 * missing, which keeps the test runner's own internals healthy.
 */

const processKey = "process";

describe("AI provider in a browser-like environment (no `process`)", () => {
  const realProcess = (globalThis as Record<string, unknown>)[processKey];

  afterEach(() => {
    // Safety net: make sure Node's process is always restored.
    (globalThis as Record<string, unknown>)[processKey] = realProcess;
  });

  it("isAiConfigured() returns false instead of throwing", async () => {
    const g = globalThis as Record<string, unknown>;
    const provider = await import("./provider");

    // Enter the browser-like window: no microtasks run between the delete
    // and the restore, so this is a faithful (and runner-safe) simulation.
    delete g[processKey];
    try {
      // Sanity: the simulation is real — bare `process` access throws
      // exactly like the original crash did.
      expect(() => new Function("return process.env")()).toThrow(
        /process is not defined/,
      );

      // The original crash site: must not throw ReferenceError.
      expect(() => provider.isAiConfigured()).not.toThrow();

      // With no env visible, no provider can be configured.
      expect(provider.isAiConfigured()).toBe(false);
      expect(provider.getAiConfigurations()).toEqual([]);
    } finally {
      g[processKey] = realProcess;
    }
  });
});
