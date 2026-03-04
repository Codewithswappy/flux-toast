"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { toastStore } from "../core/store";
import type { ToastProviderProps, ToastPosition } from "../core/types";

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  position: ToastPosition;
  headless: boolean;
  gap: number;
  theme: "light" | "dark" | "system";
}

const ToastContext = createContext<ToastContextValue>({
  position: "bottom-right",
  headless: false,
  gap: 12,
  theme: "system",
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
    });
  }, [maxVisible, defaultDuration, position, groupDuplicates, theme]);

  const contextValue = useMemo<ToastContextValue>(
    () => ({ position, headless, gap, theme }),
    [position, headless, gap, theme],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}
