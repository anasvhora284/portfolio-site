import { useEffect, useRef } from "react";

/**
 * @param {boolean} active
 * @param {() => void} [onEscape]
 */
export function useFocusTrap(active, onEscape) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const root = ref.current;
    if (!root) return undefined;

    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first instanceof HTMLElement) first.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [active, onEscape]);

  return ref;
}
