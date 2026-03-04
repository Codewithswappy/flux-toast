import * as React from 'react';
import { ReactNode } from 'react';
import * as zustand_vanilla from 'zustand/vanilla';
import * as react_jsx_runtime from 'react/jsx-runtime';

type ToastType = "success" | "error" | "info" | "warning" | "loading";
type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
interface ToastAction {
    label: string;
    onClick: () => void;
}
interface Toast {
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
type ToastInput = Partial<Pick<Toast, "id" | "type" | "title" | "description" | "duration" | "dismissible" | "icon" | "action" | "content" | "className" | "pauseOnHover" | "onDismiss" | "onAutoClose">>;
type ToastUpdateInput = Partial<Pick<Toast, "type" | "title" | "description" | "duration" | "dismissible" | "icon" | "action" | "content" | "className" | "promiseState">>;
interface PromiseToastMessages<TData = unknown> {
    loading: string | ReactNode;
    success: string | ((data: TData) => string | ReactNode);
    error: string | ((err: unknown) => string | ReactNode);
}
interface ToastProviderProps {
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
interface ToastViewportProps {
    position?: ToastPosition;
    className?: string;
    hotkey?: string[];
    /** custom label for screen readers */
    label?: string;
}
interface ToastStoreState {
    toasts: Toast[];
    queue: Toast[];
    pausedToasts: Set<string>;
    maxVisible: number;
    defaultDuration: number;
    position: ToastPosition;
    groupDuplicates: boolean;
    theme: "light" | "dark" | "system";
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

/**
 * Create a toast notification.
 *
 * @example
 * ```ts
 * toast("Hello world")
 * toast({ title: "Hello", description: "World" })
 * ```
 */
declare function toast(messageOrInput: string | ToastInput): string;
declare namespace toast {
    var success: (messageOrInput: string | ToastInput) => string;
    var error: (messageOrInput: string | ToastInput) => string;
    var warning: (messageOrInput: string | ToastInput) => string;
    var info: (messageOrInput: string | ToastInput) => string;
    var loading: (messageOrInput: string | ToastInput) => string;
    var promise: <TData>(promise: Promise<TData>, messages: PromiseToastMessages<TData>, input?: ToastInput) => Promise<TData>;
    var dismiss: (id?: string) => void;
    var update: (id: string, data: ToastUpdateInput) => void;
    var clear: () => void;
}

/**
 * Vanilla Zustand store for toast state management.
 * Using vanilla store allows usage outside React (imperative API)
 * while still being subscribable from React via useSyncExternalStore.
 */
declare const toastStore: zustand_vanilla.StoreApi<ToastStoreState>;

declare function ToastProvider({ children, defaultDuration, maxVisible, position, headless, gap, theme, groupDuplicates, }: ToastProviderProps): react_jsx_runtime.JSX.Element;

declare function ToastViewport({ position: positionProp, className, label, }: ToastViewportProps): react_jsx_runtime.JSX.Element;

interface ToastItemProps {
    toast: Toast;
    position: ToastPosition;
    onDismiss: (id: string) => void;
}
declare const ToastItem: React.NamedExoticComponent<ToastItemProps>;

/**
 * React hook to subscribe to the toast store.
 * Uses useSyncExternalStore for concurrent mode safety.
 *
 * @example
 * ```tsx
 * const { toasts, position, theme } = useToast();
 * ```
 */
declare function useToast(): {
    toasts: Toast[];
    allToasts: Toast[];
    queue: Toast[];
    queueCount: number;
    pausedToasts: Set<string>;
    position: ToastPosition;
    theme: "light" | "dark" | "system";
    dismiss: (id: string) => void;
    pause: (id: string) => void;
    resume: (id: string) => void;
};

/**
 * Generate a unique toast ID.
 * Uses a monotonically increasing counter + timestamp for uniqueness.
 * Avoids crypto/uuid dependencies for tree-shaking.
 */
declare function generateId(): string;

/**
 * SSR-safe check for prefers-reduced-motion.
 */
declare function prefersReducedMotion(): boolean;

export { type PromiseToastMessages, type Toast, type ToastAction, type ToastInput, ToastItem, type ToastPosition, ToastProvider, type ToastProviderProps, type ToastStoreState, type ToastType, type ToastUpdateInput, ToastViewport, type ToastViewportProps, generateId, prefersReducedMotion, toast, toastStore, useToast };
