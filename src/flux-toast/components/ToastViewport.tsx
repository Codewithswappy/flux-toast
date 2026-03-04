"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../hooks/useToast";
import { useToastContext } from "./ToastProvider";
import { ToastItem } from "./ToastItem";
import type { ToastViewportProps } from "../core/types";
import { clearTimer } from "../core/queue";
import { toastStore } from "../core/store";

// ─── Position CSS mapping ────────────────────────────────────────────────────

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  "top-left": { top: 0, left: 0, alignItems: "flex-start" },
  "top-right": { top: 0, right: 0, alignItems: "flex-end" },
  "top-center": {
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    alignItems: "center",
  },
  "bottom-left": { bottom: 0, left: 0, alignItems: "flex-start" },
  "bottom-right": { bottom: 0, right: 0, alignItems: "flex-end" },
  "bottom-center": {
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    alignItems: "center",
  },
};

// ─── Viewport Component ─────────────────────────────────────────────────────

export function ToastViewport({
  position: positionProp,
  className,
  label = "Notifications",
}: ToastViewportProps) {
  const ctx = useToastContext();
  const position = positionProp ?? ctx.position;
  const { toasts, queueCount } = useToast();
  const { gap } = ctx;

  // ─── Global keyboard handler ───────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Alt+T focuses the toast region
      if (e.altKey && e.key === "t") {
        const region = document.querySelector<HTMLElement>(
          "[data-flux-toast-viewport]",
        );
        if (region) {
          e.preventDefault();
          const firstToast = region.querySelector<HTMLElement>(".flux-toast");
          firstToast?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Dismiss handler ───────────────────────────────────────────────
  const handleDismiss = useCallback((id: string) => {
    clearTimer(id);
    const current = toastStore.getState().toasts.find((t) => t.id === id);
    current?.onDismiss?.(current);
    toastStore.getState().dismissToast(id);
  }, []);

  // ─── Order toasts based on position ────────────────────────────────
  const isBottom = position.startsWith("bottom");
  const orderedToasts = isBottom ? [...toasts].reverse() : toasts;

  const viewportClasses = [
    "flux-toast-viewport",
    `flux-toast-viewport--${position}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={viewportClasses}
      data-flux-toast-viewport=""
      data-position={position}
      aria-label={`${label} (${toasts.length} notification${toasts.length !== 1 ? "s" : ""}${queueCount > 0 ? `, ${queueCount} queued` : ""})`}
      role="region"
      tabIndex={-1}
      style={{
        ...POSITION_STYLES[position],
        gap: `${gap}px`,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {orderedToasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            position={position}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </section>
  );
}
