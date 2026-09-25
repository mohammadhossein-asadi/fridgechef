"use client";

import { useEffect, type RefObject } from "react";

/**
 * Dismiss a popover-like element on tap/click outside any of `refs`, or on Escape.
 * Listens on document in the CAPTURE phase (matches MoneyTip's behavior/tests).
 * No listeners are attached while `active` is false.
 */
export function useDismissOnOutsideAndEscape(
  active: boolean,
  refs: Array<RefObject<HTMLElement | null>>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (target instanceof Node && !refs.some((r) => r.current?.contains(target))) {
        onDismiss();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [active, refs, onDismiss]);
}
