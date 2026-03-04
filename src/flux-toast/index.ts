/* ─── Core Styles ─────────────────────────────────────────────────────────── */
export { toast } from "./core/toast-controller";
export { toastStore } from "./core/store";

/* ─── Components ──────────────────────────────────────────────────────────── */
export { ToastProvider } from "./components/ToastProvider";
export { ToastViewport } from "./components/ToastViewport";
export { ToastItem } from "./components/ToastItem";

/* ─── Hooks ───────────────────────────────────────────────────────────────── */
export { useToast } from "./hooks/useToast";

/* ─── Types ───────────────────────────────────────────────────────────────── */
export type {
  Toast,
  ToastType,
  ToastPosition,
  ToastInput,
  ToastUpdateInput,
  ToastAction,
  ToastProviderProps,
  ToastViewportProps,
  PromiseToastMessages,
  ToastStoreState,
} from "./core/types";

/* ─── Utilities ───────────────────────────────────────────────────────────── */
export { generateId } from "./utils/id";
export { prefersReducedMotion } from "./utils/accessibility";
