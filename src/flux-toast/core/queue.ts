import type { Toast } from "./types";
import { toastStore } from "./store";

/**
 * Timer management for auto-dismiss.
 * Tracks active timers and remaining durations for pause/resume.
 */
interface TimerEntry {
  timerId: ReturnType<typeof setTimeout> | null;
  startTime: number;
  remaining: number;
  duration: number;
  isPaused: boolean;
}

const timers = new Map<string, TimerEntry>();

/**
 * Start the auto-dismiss timer for a toast.
 */
export function startTimer(toast: Toast): void {
  // Loading toasts don't auto-dismiss
  if (toast.type === "loading" || toast.promiseState === "loading") return;

  const state = toastStore.getState();
  const duration = toast.duration ?? state.defaultDuration;

  if (duration <= 0 || duration === Infinity) return;

  clearTimer(toast.id);

  const timerId = setTimeout(() => {
    const current = toastStore.getState().toasts.find((t) => t.id === toast.id);
    if (current?.visible) {
      current.onAutoClose?.(current);
      toastStore.getState().dismissToast(toast.id);
    }
    timers.delete(toast.id);
  }, duration);

  timers.set(toast.id, {
    timerId,
    startTime: Date.now(),
    remaining: duration,
    duration,
    isPaused: false,
  });
}

/**
 * Clear the auto-dismiss timer for a toast.
 */
export function clearTimer(id: string): void {
  const entry = timers.get(id);
  if (entry) {
    if (entry.timerId) clearTimeout(entry.timerId);
    timers.delete(id);
  }
}

/**
 * Pause the auto-dismiss timer (e.g., on hover).
 * Saves remaining time so it can be resumed.
 */
export function pauseTimer(id: string): void {
  const entry = timers.get(id);
  if (!entry || entry.isPaused) return;

  if (entry.timerId) clearTimeout(entry.timerId);
  entry.timerId = null;
  const elapsed = Date.now() - entry.startTime;
  entry.remaining = Math.max(0, entry.remaining - elapsed);
  entry.isPaused = true;
}

/**
 * Resume a paused auto-dismiss timer.
 */
export function resumeTimer(id: string): void {
  const entry = timers.get(id);
  if (!entry || entry.remaining <= 0 || !entry.isPaused) return;

  const timerId = setTimeout(() => {
    const current = toastStore.getState().toasts.find((t) => t.id === id);
    if (current?.visible) {
      current.onAutoClose?.(current);
      toastStore.getState().dismissToast(id);
    }
    timers.delete(id);
  }, entry.remaining);

  entry.timerId = timerId;
  entry.startTime = Date.now();
  entry.isPaused = false;
}

/**
 * Clear all timers. Used during cleanup.
 */
export function clearAllTimers(): void {
  timers.forEach((entry) => {
    if (entry.timerId) clearTimeout(entry.timerId);
  });
  timers.clear();
}

/**
 * Get remaining time for a toast timer (for progress bars).
 */
export function getRemainingTime(id: string): number | null {
  const entry = timers.get(id);
  if (!entry) return null;
  if (entry.isPaused) return entry.remaining;
  const elapsed = Date.now() - entry.startTime;
  return Math.max(0, entry.remaining - elapsed);
}

/**
 * Get total duration for a toast timer (for progress bars).
 */
export function getTotalDuration(id: string): number | null {
  const entry = timers.get(id);
  return entry?.duration ?? null;
}
