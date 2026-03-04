import type { ToastType } from "../core/types";

/**
 * Get the ARIA role for a toast type.
 * "alert" for errors/warnings, "status" for everything else.
 */
export function getAriaRole(type: ToastType): "alert" | "status" {
  return type === "error" || type === "warning" ? "alert" : "status";
}

/**
 * Get the aria-live value for a toast type.
 * "assertive" for errors/warnings, "polite" for everything else.
 */
export function getAriaLive(type: ToastType): "assertive" | "polite" {
  return type === "error" || type === "warning" ? "assertive" : "polite";
}

/**
 * SSR-safe check for prefers-reduced-motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  return mq?.matches ?? false;
}

/**
 * Announce a message to screen readers via a live region.
 * Creates a temporary visually-hidden element.
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  if (typeof document === "undefined") return;

  const el = document.createElement("div");
  el.setAttribute("role", "log");
  el.setAttribute("aria-live", priority);
  el.setAttribute("aria-atomic", "true");
  el.style.position = "absolute";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.padding = "0";
  el.style.margin = "-1px";
  el.style.overflow = "hidden";
  el.style.clip = "rect(0, 0, 0, 0)";
  el.style.whiteSpace = "nowrap";
  el.style.border = "0";

  document.body.appendChild(el);

  // Delay to ensure screen reader picks up the change
  requestAnimationFrame(() => {
    el.textContent = message;
  });

  setTimeout(() => {
    document.body.removeChild(el);
  }, 1000);
}
