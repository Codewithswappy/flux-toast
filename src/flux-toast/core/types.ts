import type { ReactNode } from "react";

// ─── Toast Types ─────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning" | "loading";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  createdAt: number;
  visible: boolean;
  dismissible?: boolean;
  icon?: ReactNode;
  action?: ToastAction;
  count: number;
  /** used for grouping duplicates */
  fingerprint?: string;
  /** custom JSX content */
  content?: ReactNode;
  /** className override */
  className?: string;
  /** promise lifecycle state */
  promiseState?: "idle" | "loading" | "success" | "error";
  /** data resolved from promise */
  promiseData?: unknown;
  /** error from rejected promise */
  promiseError?: unknown;
  /** pause auto-dismiss on hover */
  pauseOnHover?: boolean;
  /** callback when toast is dismissed */
  onDismiss?: (toast: Toast) => void;
  /** callback when toast auto-closes */
  onAutoClose?: (toast: Toast) => void;
}

// ─── Toast Input (what the user passes) ──────────────────────────────────────

export type ToastInput = Partial<
  Pick<
    Toast,
    | "id"
    | "type"
    | "title"
    | "description"
    | "duration"
    | "dismissible"
    | "icon"
    | "action"
    | "content"
    | "className"
    | "pauseOnHover"
    | "onDismiss"
    | "onAutoClose"
  >
>;

export type ToastUpdateInput = Partial<
  Pick<
    Toast,
    | "type"
    | "title"
    | "description"
    | "duration"
    | "dismissible"
    | "icon"
    | "action"
    | "content"
    | "className"
    | "promiseState"
  >
>;

// ─── Promise Handler ─────────────────────────────────────────────────────────

export interface PromiseToastMessages<TData = unknown> {
  loading: string | ReactNode;
  success: string | ((data: TData) => string | ReactNode);
  error: string | ((err: unknown) => string | ReactNode);
}

// ─── Provider Props ──────────────────────────────────────────────────────────

export interface ToastProviderProps {
  children: ReactNode;
  /** default duration in ms (default: 4000) */
  defaultDuration?: number;
  /** max visible toasts (default: 5) */
  maxVisible?: number;
  /** default position (default: "bottom-right") */
  position?: ToastPosition;
  /** enable headless mode — no default styles */
  headless?: boolean;
  /** gap between toasts in px (default: 12) */
  gap?: number;
  /** theme: "light" | "dark" | "system" */
  theme?: "light" | "dark" | "system";
  /** group duplicate toasts */
  groupDuplicates?: boolean;
}

// ─── Viewport Props ──────────────────────────────────────────────────────────

export interface ToastViewportProps {
  position?: ToastPosition;
  className?: string;
  hotkey?: string[];
  /** custom label for screen readers */
  label?: string;
}

// ─── Store State ─────────────────────────────────────────────────────────────

export interface ToastStoreState {
  toasts: Toast[];
  queue: Toast[];
  pausedToasts: Set<string>;
  maxVisible: number;
  defaultDuration: number;
  position: ToastPosition;
  groupDuplicates: boolean;
  theme: "light" | "dark" | "system";

  // Actions
  addToast: (toast: Toast) => void;
  updateToast: (id: string, data: ToastUpdateInput) => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
  promoteFromQueue: () => void;
  configure: (config: Partial<Pick<ToastStoreState, "maxVisible" | "defaultDuration" | "position" | "groupDuplicates" | "theme">>) => void;
}
