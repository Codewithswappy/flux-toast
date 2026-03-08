"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { toastStore } from "../core/store";
import type {
  ToastProviderProps,
  ToastPosition,
  ToastPattern,
} from "../core/types";

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  position: ToastPosition;
  headless: boolean;
  gap: number;
  theme: "light" | "dark" | "system";
  pattern: ToastPattern;
}

const ToastContext = createContext<ToastContextValue>({
  position: "bottom-right",
  headless: false,
  gap: 12,
  theme: "system",
  pattern: "dash-node",
});

export const useToastContext = () => useContext(ToastContext);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({
  children,
  defaultDuration = 15000,
  maxVisible = 5,
  position = "bottom-right",
  headless = false,
  gap = 12,
  theme = "system",
  pattern = "none",
  groupDuplicates = true,
}: ToastProviderProps) {
  // Configure store on mount and when props change
  useEffect(() => {
    toastStore.getState().configure({
      maxVisible,
      defaultDuration,
      position,
      groupDuplicates,
      theme,
      pattern,
    });
  }, [maxVisible, defaultDuration, position, groupDuplicates, theme, pattern]);

  const contextValue = useMemo<ToastContextValue>(
    () => ({ position, headless, gap, theme, pattern }),
    [position, headless, gap, theme, pattern],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}
