// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SwUpdater } from "./SwUpdater";

type Listener = (event: Event) => void;

function makeFakeWorker(state: string) {
  const listeners: Record<string, Listener[]> = {};
  return {
    state,
    addEventListener: (type: string, fn: Listener) => {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener: (type: string, fn: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    emit: (type: string) => {
      (listeners[type] ?? []).forEach((fn) => fn(new Event(type)));
    },
  };
}

function makeFakeRegistration(
  partial: { waiting?: unknown; installing?: unknown } = {},
) {
  const listeners: Record<string, Listener[]> = {};
  return {
    waiting: partial.waiting ?? null,
    installing: partial.installing ?? null,
    addEventListener: (type: string, fn: Listener) => {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener: (type: string, fn: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    /** Fire updatefound on the registration (test helper). */
    fireUpdateFound: () => {
      (listeners["updatefound"] ?? []).forEach((fn) => fn(new Event("updatefound")));
    },
  };
}

const RELOAD_FLAG = "sofreh-sw-reloaded";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  window.sessionStorage.clear();
});

function stubNavigator(register: ReturnType<typeof vi.fn>) {
  vi.stubGlobal("navigator", {
    serviceWorker: { register },
  });
}

describe("SwUpdater", () => {
  it("renders nothing and mounts/unmounts without throwing", () => {
    const { unmount } = render(<SwUpdater />);
    unmount();
  });

  it("does not register a service worker outside production", () => {
    const register = vi.fn();
    stubNavigator(register);
    render(<SwUpdater />);
    expect(register).not.toHaveBeenCalled();
  });

  it("registers /sw.js in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const register = vi.fn().mockResolvedValue(makeFakeRegistration());
    stubNavigator(register);

    render(<SwUpdater />);
    await vi.waitFor(() =>
      expect(register).toHaveBeenCalledWith("/sw.js"),
    );
  });

  it("reloads when a new service worker is already waiting on load", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const waiting = makeFakeWorker("waiting");
    const register = vi
      .fn()
      .mockResolvedValue(makeFakeRegistration({ waiting }));
    stubNavigator(register);

    render(<SwUpdater />);
    await vi.waitFor(() =>
      expect(window.sessionStorage.getItem(RELOAD_FLAG)).toBe("1"),
    );
  });

  it("reloads when updatefound installs a new worker into waiting", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const installing = makeFakeWorker("installing");
    const registration = makeFakeRegistration({ installing });
    const register = vi.fn().mockResolvedValue(registration);
    stubNavigator(register);

    render(<SwUpdater />);
    await vi.waitFor(() => expect(register).toHaveBeenCalled());

    registration.fireUpdateFound();
    installing.state = "installed";
    registration.waiting = installing;
    installing.emit("statechange");

    await vi.waitFor(() =>
      expect(window.sessionStorage.getItem(RELOAD_FLAG)).toBe("1"),
    );
  });

  it("does not reload again on the pass that follows a reload (loop guard)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const installing = makeFakeWorker("installing");
    const registration = makeFakeRegistration({ installing });
    const register = vi.fn().mockResolvedValue(registration);
    stubNavigator(register);

    // We arrived via a reload, so the flag is set from the previous pass.
    window.sessionStorage.setItem(RELOAD_FLAG, "1");

    render(<SwUpdater />);
    await vi.waitFor(() => expect(register).toHaveBeenCalled());
    // The effect must clear the stale flag.
    await vi.waitFor(() =>
      expect(window.sessionStorage.getItem(RELOAD_FLAG)).toBeNull(),
    );

    // A new update landing immediately afterwards must not trigger another
    // reload (would be an infinite loop).
    registration.fireUpdateFound();
    installing.state = "installed";
    registration.waiting = installing;
    installing.emit("statechange");

    await new Promise((r) => setTimeout(r, 50));
    expect(window.sessionStorage.getItem(RELOAD_FLAG)).toBeNull();
  });
});
