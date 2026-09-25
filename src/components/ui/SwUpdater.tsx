"use client";

import { useEffect } from "react";

// Set before we reload ourselves so the next load knows the reload was
// intentional; a second consecutive guarded reload means the new worker
// never took effect, so we back off instead of looping.
const RELOAD_FLAG = "sofreh-sw-reloaded";

export function SwUpdater() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const cameFromReload =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(RELOAD_FLAG) === "1";
    // We just reloaded for a new worker: let it activate and reset the
    // flag so a *future* update can still trigger another reload.
    if (cameFromReload) {
      window.sessionStorage.removeItem(RELOAD_FLAG);
    }

    let registration: ServiceWorkerRegistration | undefined;
    let newWorker: ServiceWorker | undefined;
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;

    const guardedReload = () => {
      if (cameFromReload || reloadTimer) return;
      reloadTimer = setTimeout(() => {
        try {
          window.sessionStorage.setItem(RELOAD_FLAG, "1");
        } catch {
          // Storage unavailable (private mode) — reload anyway; worst case
          // is one extra reload, not a stale UI.
        }
        window.location.reload();
      }, 0);
    };

    const onWorkerStateChange = () => {
      // A worker that finished installing while another one is still active
      // reports state "installed" and shows up on registration.waiting.
      const reg = registration;
      if (newWorker && reg && newWorker.state === "installed" && reg.waiting) {
        guardedReload();
      }
    };

    const onFound = () => {
      newWorker = registration?.installing ?? undefined;
      if (newWorker) newWorker.addEventListener("statechange", onWorkerStateChange);
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        if (reg.waiting) {
          // A newer worker is already waiting (e.g. installed by a
          // previous tab while this one was offline) — adopt it now.
          guardedReload();
        }
        reg.addEventListener("updatefound", onFound);
      })
      .catch(() => {
        // SW is best-effort; never block the app on it.
      });

    return () => {
      if (reloadTimer) clearTimeout(reloadTimer);
      registration?.removeEventListener("updatefound", onFound);
      newWorker?.removeEventListener("statechange", onWorkerStateChange);
    };
  }, []);

  return null;
}
