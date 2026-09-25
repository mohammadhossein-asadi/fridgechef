"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatSignedToman, formatToman } from "@/lib/format";
import { useIsTouch, useReducedMotion } from "@/motion/presets";
import { useDismissOnOutsideAndEscape } from "@/hooks/useDismissOnOutsideAndEscape";
import { SPRINGS } from "@/motion/transitions";

/** How long the «کپی شد» confirmation stays on the tip before reverting */
const COPY_CONFIRM_MS = 1500;

type MoneyTipProps = {
  /** Exact amount in Toman */
  value: number;
  /** Text already shown (e.g. compact form). If equal to the exact text, no tip is rendered. */
  display: string;
  /** Use signed format (budgets) for the exact text */
  signed?: boolean;
  className?: string;
  /** Extra text color class for the visible (compact) text */
  toneClass?: string;
};

/**
 * Compact money display with the exact full تومان amount underneath:
 * hover on desktop, tap (or Enter/Space when focused) on touch.
 * On touch, tapping the revealed amount copies it («کپی شد» flashes briefly).
 * On touch, tapping anywhere outside the trigger or pressing Escape closes the tip.
 * Inside a link, the first tap only reveals the tip — the next tap navigates.
 */
export function MoneyTip({ value, display, signed = false, className, toneClass }: MoneyTipProps) {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [copied, setCopied] = useState(false); // «کپی شد» flash
  const show = open || hoverOpen || focusOpen;
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending «کپی شد» revert on unmount
  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  // On touch, the tap-revealed tooltip must also dismiss the way users
  // expect: a tap anywhere else (outside trigger *and* tip), or Escape.
  useDismissOnOutsideAndEscape(
    isTouch && open,
    [triggerRef, tipRef],
    () => {
      setOpen(false);
      setCopied(false);
    },
  );

  // Tap the revealed amount → copy it, flash «کپی شد» for a moment
  const handleTipCopy = () => {
    if (!isTouch) return;
    try {
      void navigator.clipboard.writeText(full).catch(() => {});
    } catch {
      // clipboard unavailable (e.g. insecure context) — still show feedback
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPY_CONFIRM_MS);
  };

  const full = signed ? formatSignedToman(value) : formatToman(value);
  // Nothing was compacted — there is nothing extra to reveal.
  if (full === display) {
    return (
      <span className={className} dir="rtl">
        {display}
      </span>
    );
  }

  return (
    <span dir="rtl" className={`relative inline-flex ${className ?? ""}`}>
      <span
        id={isTouch ? id : undefined}
        tabIndex={isTouch ? 0 : undefined}
        role={isTouch ? "button" : undefined}
        aria-expanded={isTouch ? open : undefined}
        aria-describedby={isTouch && show ? `${id}-tip` : undefined}        onClick={
          isTouch
            ? (e) => {
                // Inside a link, consume the first tap so it only reveals the
                // tip instead of navigating — the next tap navigates.
                if (!open && e.currentTarget.closest("a")) {
                  e.preventDefault(); // cancels the anchor's default navigation
                  e.stopPropagation(); // and keeps parent click handlers out
                  setOpen(true);
                  return;
                }
                setOpen((v) => !v);
              }
            : undefined
        }
        onKeyDown={
          isTouch
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((v) => !v);
                }
              }
            : undefined
        }
        onMouseEnter={isTouch ? undefined : () => setHoverOpen(true)}
        onMouseLeave={isTouch ? undefined : () => setHoverOpen(false)}
        onFocus={isTouch ? undefined : () => setFocusOpen(true)}
        onBlur={isTouch ? undefined : () => setFocusOpen(false)}
        className={`cursor-help border-b border-dotted border-charcoal-400/60 outline-none ${toneClass ?? ""}`}
      >
        {display}
      </span>
      <AnimatePresence>
        {show && (
          <motion.span
            key="tip"
            ref={tipRef}
            id={`${id}-tip`}
            role="tooltip"
            aria-live="polite"
            onClick={handleTipCopy}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={reduced ? { duration: 0 } : SPRINGS.snappy}
            className={`absolute right-0 top-full z-30 mt-1.5 whitespace-nowrap rounded-xl bg-white/95 px-3 py-1.5 text-[11px] font-bold card-shadow ${copied ? "text-pistachio-700" : "text-charcoal-800"}`}
          >
            {copied ? "کپی شد" : full}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
