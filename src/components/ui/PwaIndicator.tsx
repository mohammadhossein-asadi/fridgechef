"use client";

import { useEffect, useRef, useState } from "react";

// Chrome/Edge fire this with prompt()/userChoice before the browser's own
// install UI appears; Safari and Firefox never do.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" | "dismissed_by_policy" }>;
};

export function PwaIndicator() {
  const [mounted, setMounted] = useState(false);
  const [online, setOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const installEvent = useRef<BeforeInstallPromptEvent | null>(null);

  // First paint: register the offline shell (production only — dev would
  // cache a moving target), then seed the connectivity state.
  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // No-op: offline support degrades gracefully to a plain website.
      });
    }
  }, []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      installEvent.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const onAppInstalled = () => {
      installEvent.current = null;
      setCanInstall(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const evt = installEvent.current;
    if (!evt) return;
    await evt.prompt();
    const choice = await evt.userChoice;
    if (choice.outcome === "accepted") {
      installEvent.current = null;
      setCanInstall(false);
    }
  };

  return (
    <>
      {canInstall && (
        <button
          onClick={handleInstall}
          className="hidden rounded-lg bg-saffron-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-saffron-600 sm:inline-flex"
          aria-label="نصب سفره"
          title="نصب برنامه روی دستگاه"
        >
          نصب
        </button>
      )}
      {mounted && (
        <span
          aria-live="polite"
          className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline ${
            online ? "bg-pistachio-100 text-pistachio-700" : "bg-saffron-100 text-saffron-700"
          }`}
        >
          {online ? "آنلاین" : "آفلاین"}
        </span>
      )}
    </>
  );
}
