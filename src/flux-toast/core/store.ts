import { createStore } from "zustand/vanilla";
import type { Toast, ToastStoreState, ToastUpdateInput } from "./types";

/**
 * Vanilla Zustand store for toast state management.
 * Using vanilla store allows usage outside React (imperative API)
 * while still being subscribable from React via useSyncExternalStore.
 */
export const toastStore = createStore<ToastStoreState>((set) => ({
  toasts: [],
  queue: [],
  pausedToasts: new Set<string>(),
  maxVisible: 5,
  defaultDuration: 15000,
  position: "bottom-right",
  groupDuplicates: true,
  theme: "system",

  configure: (config) => set(config),

  addToast: (toast: Toast) =>
    set((state) => {
      // ─── Duplicate Grouping ──────────────────────────────────────────
      if (state.groupDuplicates && toast.fingerprint) {
        const existingIndex = state.toasts.findIndex(
          (t) => t.fingerprint === toast.fingerprint && t.visible
        );

        if (existingIndex !== -1) {
          const updated = [...state.toasts];
          updated[existingIndex] = {
            ...updated[existingIndex],
            count: updated[existingIndex].count + 1,
            createdAt: Date.now(), // reset duration timer
          };
          return { toasts: updated };
        }

        // Also check queue
        const queueIndex = state.queue.findIndex(
          (t) => t.fingerprint === toast.fingerprint
        );
        if (queueIndex !== -1) {
          const updatedQueue = [...state.queue];
          updatedQueue[queueIndex] = {
            ...updatedQueue[queueIndex],
            count: updatedQueue[queueIndex].count + 1,
          };
          return { queue: updatedQueue };
        }
      }

      // ─── Check if we exceeded max visible ────────────────────────────
      const visibleCount = state.toasts.filter((t) => t.visible).length;

      if (visibleCount >= state.maxVisible) {
        return {
          queue: [...state.queue, toast],
        };
      }

      return {
        toasts: [...state.toasts, toast],
      };
    }),

  updateToast: (id: string, data: ToastUpdateInput) =>
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  dismissToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, visible: false } : t
      ),
    })),

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () =>
    set((state) => ({
      toasts: state.toasts.map((t) => ({ ...t, visible: false })),
      queue: [],
    })),

  pauseToast: (id: string) =>
    set((state) => {
      const next = new Set(state.pausedToasts);
      next.add(id);
      return { pausedToasts: next };
    }),

  resumeToast: (id: string) =>
    set((state) => {
      const next = new Set(state.pausedToasts);
      next.delete(id);
      return { pausedToasts: next };
    }),

  promoteFromQueue: () =>
    set((state) => {
      if (state.queue.length === 0) return state;

      const visibleCount = state.toasts.filter((t) => t.visible).length;
      if (visibleCount >= state.maxVisible) return state;

      const slotsAvailable = state.maxVisible - visibleCount;
      const toPromote = state.queue.slice(0, slotsAvailable);
      const remainingQueue = state.queue.slice(slotsAvailable);

      return {
        toasts: [
          ...state.toasts,
          ...toPromote.map((t) => ({
            ...t,
            visible: true,
            createdAt: Date.now(),
          })),
        ],
        queue: remainingQueue,
      };
    }),
}));
