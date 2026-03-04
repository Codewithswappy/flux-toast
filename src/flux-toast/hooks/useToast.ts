"use client";

import { useSyncExternalStore, useCallback } from "react";
import { toastStore } from "../core/store";
import type { Toast, ToastPosition } from "../core/types";

// ─── Stable SSR fallback references (must be module-level constants) ─────────
// useSyncExternalStore requires getServerSnapshot to return a cached value.
// Creating new objects/arrays inline causes infinite re-render loops.

const EMPTY_TOASTS: Toast[] = [];
const EMPTY_SET = new Set<string>();
const DEFAULT_POSITION: ToastPosition = "bottom-right";
const DEFAULT_THEME = "system" as const;

// ─── Stable snapshot selectors ───────────────────────────────────────────────

const getToasts = () => toastStore.getState().toasts;
const getQueue = () => toastStore.getState().queue;
const getPausedToasts = () => toastStore.getState().pausedToasts;
const getPosition = () => toastStore.getState().position;
const getTheme = () => toastStore.getState().theme;
const subscribe = toastStore.subscribe;

// ─── SSR snapshot getters ────────────────────────────────────────────────────

const getServerToasts = () => EMPTY_TOASTS;
const getServerQueue = () => EMPTY_TOASTS;
const getServerPausedToasts = () => EMPTY_SET;
const getServerPosition = () => DEFAULT_POSITION;
const getServerTheme = () => DEFAULT_THEME;

/**
 * React hook to subscribe to the toast store.
 * Uses useSyncExternalStore for concurrent mode safety.
 *
 * @example
 * ```tsx
 * const { toasts, position, theme } = useToast();
 * ```
 */
export function useToast() {
  const toasts = useSyncExternalStore(subscribe, getToasts, getServerToasts);
  const queue = useSyncExternalStore(subscribe, getQueue, getServerQueue);
  const pausedToasts = useSyncExternalStore(subscribe, getPausedToasts, getServerPausedToasts);
  const position = useSyncExternalStore(subscribe, getPosition, getServerPosition);
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const visibleToasts = toasts.filter((t) => t.visible);
  const queueCount = queue.length;

  const dismiss = useCallback((id: string) => {
    toastStore.getState().dismissToast(id);
  }, []);

  const pause = useCallback((id: string) => {
    toastStore.getState().pauseToast(id);
  }, []);

  const resume = useCallback((id: string) => {
    toastStore.getState().resumeToast(id);
  }, []);

  return {
    toasts: visibleToasts,
    allToasts: toasts,
    queue,
    queueCount,
    pausedToasts,
    position,
    theme,
    dismiss,
    pause,
    resume,
  };
}
