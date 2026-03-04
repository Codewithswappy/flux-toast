'use strict';

var vanilla = require('zustand/vanilla');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var react$1 = require('motion/react');

var toastStore = vanilla.createStore((set) => ({
  toasts: [],
  queue: [],
  pausedToasts: /* @__PURE__ */ new Set(),
  maxVisible: 5,
  defaultDuration: 15e3,
  position: "bottom-right",
  groupDuplicates: true,
  theme: "system",
  configure: (config) => set(config),
  addToast: (toast2) => set((state) => {
    if (state.groupDuplicates && toast2.fingerprint) {
      const existingIndex = state.toasts.findIndex(
        (t) => t.fingerprint === toast2.fingerprint && t.visible
      );
      if (existingIndex !== -1) {
        const updated = [...state.toasts];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + 1,
          createdAt: Date.now()
          // reset duration timer
        };
        return { toasts: updated };
      }
      const queueIndex = state.queue.findIndex(
        (t) => t.fingerprint === toast2.fingerprint
      );
      if (queueIndex !== -1) {
        const updatedQueue = [...state.queue];
        updatedQueue[queueIndex] = {
          ...updatedQueue[queueIndex],
          count: updatedQueue[queueIndex].count + 1
        };
        return { queue: updatedQueue };
      }
    }
    const visibleCount = state.toasts.filter((t) => t.visible).length;
    if (visibleCount >= state.maxVisible) {
      return {
        queue: [...state.queue, toast2]
      };
    }
    return {
      toasts: [...state.toasts, toast2]
    };
  }),
  updateToast: (id, data) => set((state) => ({
    toasts: state.toasts.map(
      (t) => t.id === id ? { ...t, ...data } : t
    )
  })),
  dismissToast: (id) => set((state) => ({
    toasts: state.toasts.map(
      (t) => t.id === id ? { ...t, visible: false } : t
    )
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  clearAll: () => set((state) => ({
    toasts: state.toasts.map((t) => ({ ...t, visible: false })),
    queue: []
  })),
  pauseToast: (id) => set((state) => {
    const next = new Set(state.pausedToasts);
    next.add(id);
    return { pausedToasts: next };
  }),
  resumeToast: (id) => set((state) => {
    const next = new Set(state.pausedToasts);
    next.delete(id);
    return { pausedToasts: next };
  }),
  promoteFromQueue: () => set((state) => {
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
          createdAt: Date.now()
        }))
      ],
      queue: remainingQueue
    };
  })
}));

// utils/id.ts
var counter = 0;
function generateId() {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return `flux-toast-${Date.now()}-${counter}`;
}
function generateFingerprint(type, title, description) {
  return `${type}::${title ?? ""}::${description ?? ""}`;
}

// core/queue.ts
var timers = /* @__PURE__ */ new Map();
function startTimer(toast2) {
  if (toast2.type === "loading" || toast2.promiseState === "loading") return;
  const state = toastStore.getState();
  const duration = toast2.duration ?? state.defaultDuration;
  if (duration <= 0 || duration === Infinity) return;
  clearTimer(toast2.id);
  const timerId = setTimeout(() => {
    const current = toastStore.getState().toasts.find((t) => t.id === toast2.id);
    if (current?.visible) {
      current.onAutoClose?.(current);
      toastStore.getState().dismissToast(toast2.id);
    }
    timers.delete(toast2.id);
  }, duration);
  timers.set(toast2.id, {
    timerId,
    startTime: Date.now(),
    remaining: duration,
    duration,
    isPaused: false
  });
}
function clearTimer(id) {
  const entry = timers.get(id);
  if (entry) {
    if (entry.timerId) clearTimeout(entry.timerId);
    timers.delete(id);
  }
}
function pauseTimer(id) {
  const entry = timers.get(id);
  if (!entry || entry.isPaused) return;
  if (entry.timerId) clearTimeout(entry.timerId);
  entry.timerId = null;
  const elapsed = Date.now() - entry.startTime;
  entry.remaining = Math.max(0, entry.remaining - elapsed);
  entry.isPaused = true;
}
function resumeTimer(id) {
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
function getRemainingTime(id) {
  const entry = timers.get(id);
  if (!entry) return null;
  if (entry.isPaused) return entry.remaining;
  const elapsed = Date.now() - entry.startTime;
  return Math.max(0, entry.remaining - elapsed);
}
function getTotalDuration(id) {
  const entry = timers.get(id);
  return entry?.duration ?? null;
}

// utils/accessibility.ts
function getAriaRole(type) {
  return type === "error" || type === "warning" ? "alert" : "status";
}
function getAriaLive(type) {
  return type === "error" || type === "warning" ? "assertive" : "polite";
}
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  return mq?.matches ?? false;
}
function announceToScreenReader(message, priority = "polite") {
  if (typeof document === "undefined") return;
  const el = document.createElement("div");
  el.setAttribute("role", "log");
  el.setAttribute("aria-live", priority);
  el.setAttribute("aria-atomic", "true");
  el.style.position = "absolute";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.padding = "0";
  el.style.margin = "-1px";
  el.style.overflow = "hidden";
  el.style.clip = "rect(0, 0, 0, 0)";
  el.style.whiteSpace = "nowrap";
  el.style.border = "0";
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.textContent = message;
  });
  setTimeout(() => {
    document.body.removeChild(el);
  }, 1e3);
}

// core/toast-controller.ts
function createToast(input) {
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
    onAutoClose: input.onAutoClose
  };
}
function dispatchToast(input) {
  const toast2 = createToast(input);
  toastStore.getState().addToast(toast2);
  const message = toast2.title || toast2.description;
  if (message && typeof message === "string") {
    announceToScreenReader(message, getAriaLive(toast2.type));
  }
  return toast2.id;
}
function toast(messageOrInput) {
  const input = typeof messageOrInput === "string" ? { title: messageOrInput } : messageOrInput;
  return dispatchToast({ type: "info", ...input });
}
toast.success = (messageOrInput) => {
  const input = typeof messageOrInput === "string" ? { title: messageOrInput } : messageOrInput;
  return dispatchToast({ ...input, type: "success" });
};
toast.error = (messageOrInput) => {
  const input = typeof messageOrInput === "string" ? { title: messageOrInput } : messageOrInput;
  return dispatchToast({ ...input, type: "error" });
};
toast.warning = (messageOrInput) => {
  const input = typeof messageOrInput === "string" ? { title: messageOrInput } : messageOrInput;
  return dispatchToast({ ...input, type: "warning" });
};
toast.info = (messageOrInput) => {
  const input = typeof messageOrInput === "string" ? { title: messageOrInput } : messageOrInput;
  return dispatchToast({ ...input, type: "info" });
};
toast.loading = (messageOrInput) => {
  const input = typeof messageOrInput === "string" ? { title: messageOrInput } : messageOrInput;
  return dispatchToast({ ...input, type: "loading" });
};
toast.promise = (promise, messages, input) => {
  const loadingMessage = typeof messages.loading === "string" ? messages.loading : void 0;
  const id = dispatchToast({
    ...input,
    type: "loading",
    title: loadingMessage,
    content: typeof messages.loading !== "string" ? messages.loading : void 0,
    duration: Infinity
  });
  toastStore.getState().updateToast(id, { promiseState: "loading" });
  promise.then((data) => {
    const successMsg = typeof messages.success === "function" ? messages.success(data) : messages.success;
    const title = typeof successMsg === "string" ? successMsg : void 0;
    const content = typeof successMsg !== "string" ? successMsg : void 0;
    toastStore.getState().updateToast(id, {
      type: "success",
      title,
      content,
      promiseState: "success",
      duration: input?.duration
    });
    return data;
  }).catch((error) => {
    const errorMsg = typeof messages.error === "function" ? messages.error(error) : messages.error;
    const title = typeof errorMsg === "string" ? errorMsg : void 0;
    const content = typeof errorMsg !== "string" ? errorMsg : void 0;
    toastStore.getState().updateToast(id, {
      type: "error",
      title,
      content,
      promiseState: "error",
      duration: input?.duration
    });
  });
  return promise;
};
toast.dismiss = (id) => {
  if (id) {
    clearTimer(id);
    const current = toastStore.getState().toasts.find((t) => t.id === id);
    current?.onDismiss?.(current);
    toastStore.getState().dismissToast(id);
  } else {
    toastStore.getState().clearAll();
  }
};
toast.update = (id, data) => {
  toastStore.getState().updateToast(id, data);
};
toast.clear = () => {
  toastStore.getState().clearAll();
};
var ToastContext = react.createContext({
  position: "bottom-right",
  headless: false,
  gap: 12,
  theme: "system"
});
var useToastContext = () => react.useContext(ToastContext);
function ToastProvider({
  children,
  defaultDuration = 15e3,
  maxVisible = 5,
  position = "bottom-right",
  headless = false,
  gap = 12,
  theme = "system",
  groupDuplicates = true
}) {
  react.useEffect(() => {
    toastStore.getState().configure({
      maxVisible,
      defaultDuration,
      position,
      groupDuplicates,
      theme
    });
  }, [maxVisible, defaultDuration, position, groupDuplicates, theme]);
  const contextValue = react.useMemo(
    () => ({ position, headless, gap, theme }),
    [position, headless, gap, theme]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(ToastContext.Provider, { value: contextValue, children });
}
var EMPTY_TOASTS = [];
var EMPTY_SET = /* @__PURE__ */ new Set();
var DEFAULT_POSITION = "bottom-right";
var DEFAULT_THEME = "system";
var getToasts = () => toastStore.getState().toasts;
var getQueue = () => toastStore.getState().queue;
var getPausedToasts = () => toastStore.getState().pausedToasts;
var getPosition = () => toastStore.getState().position;
var getTheme = () => toastStore.getState().theme;
var subscribe = toastStore.subscribe;
var getServerToasts = () => EMPTY_TOASTS;
var getServerQueue = () => EMPTY_TOASTS;
var getServerPausedToasts = () => EMPTY_SET;
var getServerPosition = () => DEFAULT_POSITION;
var getServerTheme = () => DEFAULT_THEME;
function useToast() {
  const toasts = react.useSyncExternalStore(subscribe, getToasts, getServerToasts);
  const queue = react.useSyncExternalStore(subscribe, getQueue, getServerQueue);
  const pausedToasts = react.useSyncExternalStore(subscribe, getPausedToasts, getServerPausedToasts);
  const position = react.useSyncExternalStore(subscribe, getPosition, getServerPosition);
  const theme = react.useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const visibleToasts = toasts.filter((t) => t.visible);
  const queueCount = queue.length;
  const dismiss = react.useCallback((id) => {
    toastStore.getState().dismissToast(id);
  }, []);
  const pause = react.useCallback((id) => {
    toastStore.getState().pauseToast(id);
  }, []);
  const resume = react.useCallback((id) => {
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
    resume
  };
}

// utils/animation.ts
function getSlideDirection(position) {
  if (position.includes("right")) return { x: 120, y: 0 };
  if (position.includes("left")) return { x: -120, y: 0 };
  if (position.startsWith("top")) return { x: 0, y: -80 };
  return { x: 0, y: 80 };
}
function getEnterAnimation(position) {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15 }
    };
  }
  const { x, y } = getSlideDirection(position);
  return {
    initial: {
      opacity: 0,
      x: x * 0.8,
      y: y * 0.8,
      rotateX: position.startsWith("top") ? -25 : 25,
      scale: 0.9,
      transformPerspective: 1e3,
      filter: "blur(12px)"
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateX: 0,
      scale: 1,
      filter: "blur(0px)"
    },
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 24,
      mass: 0.6,
      restDelta: 1e-3,
      restSpeed: 1e-3
    }
  };
}
function getExitAnimation(position) {
  if (prefersReducedMotion()) {
    return {
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    };
  }
  const { x, y } = getSlideDirection(position);
  return {
    exit: {
      opacity: 0,
      x: x * 0.5,
      y: y * 0.5,
      scale: 0.95,
      rotateX: position.startsWith("top") ? 15 : -15,
      filter: "blur(8px)",
      transition: {
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1]
      }
    }
  };
}
var layoutTransition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.6
};
function NodeLinesPattern() {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flux-toast-pattern", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "100%", height: "100%", children: [
    /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsxs(
      "pattern",
      {
        id: "node-lines",
        x: "0",
        y: "0",
        width: "32",
        height: "32",
        patternUnits: "userSpaceOnUse",
        patternTransform: "rotate(15)",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "circle",
            {
              cx: "16",
              cy: "16",
              r: "1.5",
              className: "flux-toast-pattern-dot"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "path",
            {
              d: "M16 16L32 32M16 16L0 0M16 16L32 0M16 16L0 32",
              className: "flux-toast-pattern-line"
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: "url(#node-lines)" })
  ] }) });
}
function SuccessIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    react$1.motion.svg,
    {
      className: "flux-toast-icon flux-toast-icon--success",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.circle,
          {
            cx: "12",
            cy: "12",
            r: "9",
            initial: { pathLength: 0, opacity: 0, scale: 0.8 },
            animate: { pathLength: 1, opacity: 1, scale: 1 },
            transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.path,
          {
            d: "M9 12l2 2l4 -4",
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 1 },
            transition: { duration: 0.4, delay: 0.2, ease: "easeOut" }
          }
        )
      ]
    }
  );
}
function ErrorIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    react$1.motion.svg,
    {
      className: "flux-toast-icon flux-toast-icon--error",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.circle,
          {
            cx: "12",
            cy: "12",
            r: "9",
            initial: { pathLength: 0, opacity: 0, scale: 0.8 },
            animate: { pathLength: 1, opacity: 1, scale: 1 },
            transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.path,
          {
            d: "M10 10l4 4m0 -4l-4 4",
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 1 },
            transition: { duration: 0.4, delay: 0.2, ease: "easeOut" }
          }
        )
      ]
    }
  );
}
function WarningIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    react$1.motion.svg,
    {
      className: "flux-toast-icon flux-toast-icon--warning",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.path,
          {
            d: "M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75",
            initial: { pathLength: 0, opacity: 0, scale: 0.8 },
            animate: { pathLength: 1, opacity: 1, scale: 1 },
            transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] },
            style: { originX: "50%", originY: "50%" }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.path,
          {
            d: "M12 9v2m0 4v.01",
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 1 },
            transition: { duration: 0.4, delay: 0.25, ease: "easeOut" }
          }
        )
      ]
    }
  );
}
function InfoIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    react$1.motion.svg,
    {
      className: "flux-toast-icon flux-toast-icon--info",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.circle,
          {
            cx: "12",
            cy: "12",
            r: "9",
            initial: { pathLength: 0, opacity: 0, scale: 0.8 },
            animate: { pathLength: 1, opacity: 1, scale: 1 },
            transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.path,
          {
            d: "M12 8h.01M11 12h1v4h1",
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 1 },
            transition: { duration: 0.4, delay: 0.2, ease: "easeOut" }
          }
        )
      ]
    }
  );
}
function LoadingIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    react$1.motion.svg,
    {
      className: "flux-toast-icon flux-toast-icon--loading",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntime.jsx(
        react$1.motion.path,
        {
          d: "M12 3a9 9 0 1 0 9 9",
          initial: { rotate: 0 },
          animate: { rotate: 360 },
          transition: { duration: 1, repeat: Infinity, ease: "linear" },
          style: { originX: "50%", originY: "50%" }
        }
      )
    }
  );
}
function CloseIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      className: "flux-toast-close-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6l-12 12M6 6l12 12" })
    }
  );
}
function ChevronDownIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      className: "flux-toast-chevron-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 9l6 6l6 -6" })
    }
  );
}
function ChevronUpIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      className: "flux-toast-chevron-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 15l6 -6l6 6" })
    }
  );
}
var ICON_MAP = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  loading: LoadingIcon
};
var ToastItem = react.memo(function ToastItem2({
  toast: toast2,
  position,
  onDismiss
}) {
  const { headless } = useToastContext();
  const toastRef = react.useRef(null);
  const dragX = react$1.useMotionValue(0);
  const dragY = react$1.useMotionValue(0);
  const isHorizontal = position.includes("right") || position.includes("left");
  const dragValue = isHorizontal ? dragX : dragY;
  const opacity = react$1.useTransform(
    dragValue,
    [-120, -80, 0, 80, 120],
    [0, 1, 1, 1, 0]
  );
  const enterAnim = getEnterAnimation(position);
  const exitAnim = getExitAnimation(position);
  const isExpandable = !!toast2.description || !!toast2.action;
  const [expanded, setExpanded] = react.useState(false);
  const [isHovered, setIsHovered] = react.useState(false);
  const [isStopped, setIsStopped] = react.useState(false);
  const [remainingTime, setRemainingTime] = react.useState(
    () => toast2.duration ?? toastStore.getState().defaultDuration
  );
  const handleMouseEnter = react.useCallback(() => {
    setIsHovered(true);
    if (toast2.pauseOnHover !== false) {
      pauseTimer(toast2.id);
      toastStore.getState().pauseToast(toast2.id);
    }
  }, [toast2.id, toast2.pauseOnHover]);
  const handleMouseLeave = react.useCallback(() => {
    setIsHovered(false);
    if (toast2.pauseOnHover !== false && !isStopped) {
      resumeTimer(toast2.id);
      toastStore.getState().resumeToast(toast2.id);
    }
  }, [toast2.id, toast2.pauseOnHover, isStopped]);
  react.useEffect(() => {
    if (isStopped || toast2.duration === Infinity || toast2.duration === 0)
      return;
    const interval = setInterval(() => {
      const rem = getRemainingTime(toast2.id);
      if (rem !== null) {
        setRemainingTime(rem);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast2.id, isStopped, toast2.duration]);
  const handleStop = react.useCallback(
    (e) => {
      e.stopPropagation();
      clearTimer(toast2.id);
      toastStore.getState().pauseToast(toast2.id);
      setIsStopped(true);
    },
    [toast2.id]
  );
  const handleKeyDown = react.useCallback(
    (e) => {
      if (e.key === "Escape" && toast2.dismissible !== false) {
        e.preventDefault();
        onDismiss(toast2.id);
      }
    },
    [toast2.id, toast2.dismissible, onDismiss]
  );
  const handleDragEnd = react.useCallback(
    (_, info) => {
      const absX = Math.abs(info.offset.x);
      const absY = Math.abs(info.offset.y);
      const threshold = 80;
      if (isHorizontal && absX > threshold || !isHorizontal && absY > threshold) {
        onDismiss(toast2.id);
      }
    },
    [toast2.id, isHorizontal, onDismiss]
  );
  const handleAnimationComplete = react.useCallback(
    (definition) => {
      if (definition === "exit") {
        toastStore.getState().removeToast(toast2.id);
        requestAnimationFrame(() => {
          toastStore.getState().promoteFromQueue();
        });
      }
    },
    [toast2.id]
  );
  react.useEffect(() => {
    if (toast2.type !== "loading" && toast2.promiseState !== "loading") {
      startTimer(toast2);
    }
    return () => {
      clearTimer(toast2.id);
    };
  }, [
    toast2.id,
    toast2.createdAt,
    toast2.duration,
    toast2.type,
    toast2.promiseState
  ]);
  const totalDuration = getTotalDuration(toast2.id) || toastStore.getState().defaultDuration;
  const percent = totalDuration > 0 ? (totalDuration - remainingTime) / totalDuration * 100 : 0;
  const showTimers = !isStopped && toast2.duration !== Infinity && toast2.duration !== 0 && remainingTime > 0;
  const IconComponent = toast2.icon ?? (ICON_MAP[toast2.type] ? ICON_MAP[toast2.type]() : null);
  const showCustomIcon = toast2.icon !== void 0;
  const classNames = [
    "flux-toast",
    `flux-toast--${toast2.type}`,
    expanded ? "flux-toast--expanded" : "",
    toast2.className,
    headless ? "flux-toast--headless" : ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxRuntime.jsxs(
    react$1.motion.div,
    {
      ref: toastRef,
      className: classNames,
      role: getAriaRole(toast2.type),
      "aria-live": getAriaLive(toast2.type),
      "aria-atomic": "true",
      tabIndex: 0,
      layout: true,
      layoutId: toast2.id,
      initial: enterAnim.initial,
      animate: enterAnim.animate,
      exit: exitAnim.exit,
      transition: { ...enterAnim.transition, layout: layoutTransition },
      onAnimationComplete: handleAnimationComplete,
      drag: isHorizontal ? "x" : "y",
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
      dragElastic: 0.5,
      dragSnapToOrigin: true,
      onDragEnd: handleDragEnd,
      style: { opacity, x: dragX, y: dragY },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleKeyDown,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(NodeLinesPattern, {}),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flux-toast-header", children: [
          (showCustomIcon || IconComponent) && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flux-toast-icon-wrapper", "aria-hidden": "true", children: showCustomIcon ? toast2.icon : IconComponent }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flux-toast-title-wrapper", children: toast2.content ? toast2.content : toast2.title && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flux-toast-title", children: toast2.title }) }),
          toast2.count > 1 && /* @__PURE__ */ jsxRuntime.jsx(
            react$1.motion.span,
            {
              className: "flux-toast-badge",
              initial: { scale: 0.5, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { type: "spring", stiffness: 500, damping: 25 },
              "aria-label": `${toast2.count} notifications`,
              children: toast2.count
            },
            toast2.count
          ),
          isExpandable && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              className: "flux-toast-btn",
              onClick: (e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              },
              "aria-label": expanded ? "Collapse notification" : "Expand notification",
              type: "button",
              children: expanded ? /* @__PURE__ */ jsxRuntime.jsx(ChevronUpIcon, {}) : /* @__PURE__ */ jsxRuntime.jsx(ChevronDownIcon, {})
            }
          ),
          toast2.dismissible !== false && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              className: "flux-toast-btn flux-toast-close",
              onClick: (e) => {
                e.stopPropagation();
                onDismiss(toast2.id);
              },
              "aria-label": "Dismiss notification",
              type: "button",
              children: /* @__PURE__ */ jsxRuntime.jsx(CloseIcon, {})
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(react$1.AnimatePresence, { initial: false, children: expanded && /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
            transition: { duration: 0.2, ease: "easeOut" },
            className: "flux-toast-body-wrapper",
            children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flux-toast-body", children: [
              toast2.description && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flux-toast-description", children: toast2.description }),
              toast2.action && /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  className: "flux-toast-action",
                  onClick: (e) => {
                    e.stopPropagation();
                    toast2.action.onClick();
                    onDismiss(toast2.id);
                  },
                  type: "button",
                  children: toast2.action.label
                }
              )
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(react$1.AnimatePresence, { initial: false, children: showTimers && /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
            transition: { duration: 0.15, ease: "easeOut" },
            className: "flux-toast-footer-wrapper",
            children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flux-toast-footer", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flux-toast-timer-text", children: [
                "This message will close in",
                " ",
                /* @__PURE__ */ jsxRuntime.jsx("strong", { children: Math.ceil(remainingTime / 1e3) }),
                " seconds."
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("button", { className: "flux-toast-stop-btn", onClick: handleStop, children: "Click to stop." })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(react$1.AnimatePresence, { initial: false, children: showTimers && /* @__PURE__ */ jsxRuntime.jsx(
          react$1.motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "flux-toast-progress-bar",
            style: { width: `${Math.max(0, percent)}%` }
          }
        ) })
      ]
    }
  );
});
var POSITION_STYLES = {
  "top-left": { top: 0, left: 0, alignItems: "flex-start" },
  "top-right": { top: 0, right: 0, alignItems: "flex-end" },
  "top-center": {
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    alignItems: "center"
  },
  "bottom-left": { bottom: 0, left: 0, alignItems: "flex-start" },
  "bottom-right": { bottom: 0, right: 0, alignItems: "flex-end" },
  "bottom-center": {
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    alignItems: "center"
  }
};
function ToastViewport({
  position: positionProp,
  className,
  label = "Notifications"
}) {
  const ctx = useToastContext();
  const position = positionProp ?? ctx.position;
  const { toasts, queueCount } = useToast();
  const { gap } = ctx;
  react.useEffect(() => {
    function handleKeyDown(e) {
      if (e.altKey && e.key === "t") {
        const region = document.querySelector(
          "[data-flux-toast-viewport]"
        );
        if (region) {
          e.preventDefault();
          const firstToast = region.querySelector(".flux-toast");
          firstToast?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  const handleDismiss = react.useCallback((id) => {
    clearTimer(id);
    const current = toastStore.getState().toasts.find((t) => t.id === id);
    current?.onDismiss?.(current);
    toastStore.getState().dismissToast(id);
  }, []);
  const isBottom = position.startsWith("bottom");
  const orderedToasts = isBottom ? [...toasts].reverse() : toasts;
  const viewportClasses = [
    "flux-toast-viewport",
    `flux-toast-viewport--${position}`,
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxRuntime.jsx(
    "section",
    {
      className: viewportClasses,
      "data-flux-toast-viewport": "",
      "data-position": position,
      "aria-label": `${label} (${toasts.length} notification${toasts.length !== 1 ? "s" : ""}${queueCount > 0 ? `, ${queueCount} queued` : ""})`,
      role: "region",
      tabIndex: -1,
      style: {
        ...POSITION_STYLES[position],
        gap: `${gap}px`
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(react$1.AnimatePresence, { mode: "popLayout", initial: false, children: orderedToasts.map((toast2) => /* @__PURE__ */ jsxRuntime.jsx(
        ToastItem,
        {
          toast: toast2,
          position,
          onDismiss: handleDismiss
        },
        toast2.id
      )) })
    }
  );
}

exports.ToastItem = ToastItem;
exports.ToastProvider = ToastProvider;
exports.ToastViewport = ToastViewport;
exports.generateId = generateId;
exports.prefersReducedMotion = prefersReducedMotion;
exports.toast = toast;
exports.toastStore = toastStore;
exports.useToast = useToast;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map