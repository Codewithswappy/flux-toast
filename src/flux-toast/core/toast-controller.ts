import type { ReactNode } from "react";
import type {
  Toast,
  ToastInput,
  ToastType,
  ToastUpdateInput,
  PromiseToastMessages,
} from "./types";
import { toastStore } from "./store";
import { generateId, generateFingerprint } from "../utils/id";
import { startTimer, clearTimer } from "./queue";
import { announceToScreenReader, getAriaLive } from "../utils/accessibility";

// ─── Internal: Create a toast object from input ──────────────────────────────

function createToast(input: ToastInput & { type: ToastType }): Toast {
  const id = input.id ?? generateId();

  return {
    id,
    type: input.type,
    title: input.title,
    description: input.description,
    duration: input.duration,
    createdAt: Date.now(),
    visible: true,
    dismissible: input.dismissible ?? true,
    icon: input.icon,
    action: input.action,
    count: 1,
    fingerprint: generateFingerprint(
      input.type,
      input.title,
      input.description
    ),
    content: input.content,
    className: input.className,
    pauseOnHover: input.pauseOnHover ?? true,
    onDismiss: input.onDismiss,
    onAutoClose: input.onAutoClose,
  };
}

// ─── Internal: Add toast and start timer ─────────────────────────────────────

function dispatchToast(input: ToastInput & { type: ToastType }): string {
  const toast = createToast(input);
  toastStore.getState().addToast(toast);

  // Announce to screen reader
  const message = toast.title || toast.description;
  if (message && typeof message === "string") {
    announceToScreenReader(message, getAriaLive(toast.type));
  }

  return toast.id;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Create a toast notification.
 *
 * @example
 * ```ts
 * toast("Hello world")
 * toast({ title: "Hello", description: "World" })
 * ```
 */
function toast(messageOrInput: string | ToastInput): string {
  const input =
    typeof messageOrInput === "string"
      ? { title: messageOrInput }
      : messageOrInput;

  return dispatchToast({ type: "info", ...input });
}

/**
 * Create a success toast.
 */
toast.success = (messageOrInput: string | ToastInput): string => {
  const input =
    typeof messageOrInput === "string"
      ? { title: messageOrInput }
      : messageOrInput;
  return dispatchToast({ ...input, type: "success" });
};

/**
 * Create an error toast.
 */
toast.error = (messageOrInput: string | ToastInput): string => {
  const input =
    typeof messageOrInput === "string"
      ? { title: messageOrInput }
      : messageOrInput;
  return dispatchToast({ ...input, type: "error" });
};

/**
 * Create a warning toast.
 */
toast.warning = (messageOrInput: string | ToastInput): string => {
  const input =
    typeof messageOrInput === "string"
      ? { title: messageOrInput }
      : messageOrInput;
  return dispatchToast({ ...input, type: "warning" });
};

/**
 * Create an info toast.
 */
toast.info = (messageOrInput: string | ToastInput): string => {
  const input =
    typeof messageOrInput === "string"
      ? { title: messageOrInput }
      : messageOrInput;
  return dispatchToast({ ...input, type: "info" });
};

/**
 * Create a loading toast.
 */
toast.loading = (messageOrInput: string | ToastInput): string => {
  const input =
    typeof messageOrInput === "string"
      ? { title: messageOrInput }
      : messageOrInput;
  return dispatchToast({ ...input, type: "loading" });
};

/**
 * Create a promise toast that automatically transitions through states.
 *
 * @example
 * ```ts
 * toast.promise(fetchData(), {
 *   loading: "Fetching data...",
 *   success: (data) => `Got ${data.length} items`,
 *   error: (err) => `Error: ${err.message}`,
 * })
 * ```
 */
toast.promise = <TData>(
  promise: Promise<TData>,
  messages: PromiseToastMessages<TData>,
  input?: ToastInput
): Promise<TData> => {
  const loadingMessage =
    typeof messages.loading === "string" ? messages.loading : undefined;

  const id = dispatchToast({
    ...input,
    type: "loading",
    title: loadingMessage,
    content: typeof messages.loading !== "string" ? messages.loading : undefined,
    duration: Infinity,
  });

  // Update store state
  toastStore.getState().updateToast(id, { promiseState: "loading" });

  promise
    .then((data) => {
      const successMsg =
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success;

      const title = typeof successMsg === "string" ? successMsg : undefined;
      const content = typeof successMsg !== "string" ? successMsg : undefined;

      toastStore.getState().updateToast(id, {
        type: "success",
        title,
        content: content as ReactNode,
        promiseState: "success",
        duration: input?.duration,
      });

      return data;
    })
    .catch((error) => {
      const errorMsg =
        typeof messages.error === "function"
          ? messages.error(error)
          : messages.error;

      const title = typeof errorMsg === "string" ? errorMsg : undefined;
      const content = typeof errorMsg !== "string" ? errorMsg : undefined;

      toastStore.getState().updateToast(id, {
        type: "error",
        title,
        content: content as ReactNode,
        promiseState: "error",
        duration: input?.duration,
      });
    });

  return promise;
};

/**
 * Dismiss a specific toast by ID.
 */
toast.dismiss = (id?: string): void => {
  if (id) {
    clearTimer(id);
    const current = toastStore.getState().toasts.find((t) => t.id === id);
    current?.onDismiss?.(current);
    toastStore.getState().dismissToast(id);
  } else {
    toastStore.getState().clearAll();
  }
};

/**
 * Update an existing toast by ID.
 */
toast.update = (id: string, data: ToastUpdateInput): void => {
  toastStore.getState().updateToast(id, data);
};

/**
 * Clear all toasts.
 */
toast.clear = (): void => {
  toastStore.getState().clearAll();
};

export { toast };
