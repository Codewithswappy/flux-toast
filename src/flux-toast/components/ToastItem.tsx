/// <reference types="react/jsx-runtime" />
"use client";

import * as React from "react";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  motion,
  useMotionValue,
  AnimatePresence,
  type PanInfo,
} from "motion/react";
import type { Toast, ToastPosition } from "../core/types";
import { useToastContext } from "./ToastProvider";
import {
  clearTimer,
  pauseTimer,
  resumeTimer,
  getRemainingTime,
  getTotalDuration,
  startTimer,
} from "../core/queue";
import { toastStore } from "../core/store";
import { getAriaRole, getAriaLive } from "../utils/accessibility";
import {
  getEnterAnimation,
  getExitAnimation,
  layoutTransition,
} from "../utils/animation";

// ─── Icons ───────────────────────────────────────────────────────────────────

function NodeLinesPattern() {
  return (
    <div className="flux-toast-pattern" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="node-lines"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(15)"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="1 3"
            />
            <circle cx="0" cy="0" r="1.5" fill="currentColor" />
          </pattern>
          <radialGradient id="fade-mask" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#node-lines)"
          mask="url(#fade-mask)"
          className="flux-toast-pattern-rect"
        />
      </svg>
    </div>
  );
}

function DotsPattern() {
  return (
    <div className="flux-toast-pattern" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            {/* Primary dots */}
            <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.8" />
            <circle cx="14" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
            {/* Secondary tiny dots for texture */}
            <circle cx="20" cy="4" r="0.5" fill="currentColor" opacity="0.3" />
            <circle cx="6" cy="18" r="0.5" fill="currentColor" opacity="0.3" />
          </pattern>
          <radialGradient id="fade-mask-dots" cx="20%" cy="30%" r="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#dots)"
          mask="url(#fade-mask-dots)"
          className="flux-toast-pattern-rect"
        />
      </svg>
    </div>
  );
}

// ─── Icons (Tabler, Animated via motion) ─────────────────────────────────────

function SuccessIcon() {
  return (
    <motion.svg
      className="flux-toast-icon flux-toast-icon--success"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      />
      <motion.path
        d="M9 12l2 2l4 -4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

function ErrorIcon() {
  return (
    <motion.svg
      className="flux-toast-icon flux-toast-icon--error"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      />
      <motion.path
        d="M10 10l4 4m0 -4l-4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

function WarningIcon() {
  return (
    <motion.svg
      className="flux-toast-icon flux-toast-icon--warning"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"
        initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.path
        d="M12 9v2m0 4v.01"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

function InfoIcon() {
  return (
    <motion.svg
      className="flux-toast-icon flux-toast-icon--info"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      />
      <motion.path
        d="M12 8h.01M11 12h1v4h1"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

function LoadingIcon() {
  return (
    <motion.svg
      className="flux-toast-icon flux-toast-icon--loading"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M12 3a9 9 0 1 0 9 9"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ originX: "50%", originY: "50%" }}
      />
    </motion.svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="flux-toast-close-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6l-12 12M6 6l12 12" />
    </svg>
  );
}

// NO CHEVRONS NEEDED
const ICON_MAP: Record<string, () => React.ReactNode> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  loading: LoadingIcon,
};

// ─── Toast Item Component ────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  position: ToastPosition;
  onDismiss: (id: string) => void;
}

export const ToastItem = memo(function ToastItem({
  toast,
  position,
  onDismiss,
}: ToastItemProps) {
  const { headless, pattern } = useToastContext();
  const toastRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const isHorizontal = position.includes("right") || position.includes("left");

  // ─── Enter / Exit animation ────────────────────────────────────────
  const enterAnim = getEnterAnimation(position);
  const exitAnim = getExitAnimation(position);

  // ─── Expandable & Timer State ──────────────────────────────────────
  const isExpandable = !!toast.description || !!toast.action;
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    () => toast.duration ?? toastStore.getState().defaultDuration,
  );

  useEffect(() => {
    if (isExpandable) {
      const timer = setTimeout(() => {
        setExpanded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isExpandable]);
  // ─── Hover pause ───────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (toast.pauseOnHover !== false) {
      pauseTimer(toast.id);
      toastStore.getState().pauseToast(toast.id);
    }
  }, [toast.id, toast.pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (toast.pauseOnHover !== false && !isStopped) {
      resumeTimer(toast.id);
      toastStore.getState().resumeToast(toast.id);
    }
  }, [toast.id, toast.pauseOnHover, isStopped]);

  // ─── Timer update effect ───────────────────────────────────────────
  useEffect(() => {
    if (isStopped || toast.duration === Infinity || toast.duration === 0)
      return;

    const interval = setInterval(() => {
      const rem = getRemainingTime(toast.id);
      if (rem !== null) {
        setRemainingTime(rem);
      }
    }, 100); // 100ms is plenty for text updates and smooth enough for progress

    return () => clearInterval(interval);
  }, [toast.id, isStopped, toast.duration]);

  // ─── Stop click handler ────────────────────────────────────────────
  const handleStop = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearTimer(toast.id);
      toastStore.getState().pauseToast(toast.id); // Also mark as paused globally
      setIsStopped(true);
    },
    [toast.id],
  );

  // ─── Keyboard handling ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" && toast.dismissible !== false) {
        e.preventDefault();
        onDismiss(toast.id);
      }
    },
    [toast.id, toast.dismissible, onDismiss],
  );

  // ─── Swipe dismiss ────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const absX = Math.abs(info.offset.x);
      const absY = Math.abs(info.offset.y);
      const threshold = 80;

      if (
        (isHorizontal && absX > threshold) ||
        (!isHorizontal && absY > threshold)
      ) {
        onDismiss(toast.id);
      }
    },
    [toast.id, isHorizontal, onDismiss],
  );

  // ─── Promote from queue on exit animation complete ─────────────────
  const handleAnimationComplete = useCallback(
    (definition: string) => {
      if (definition === "exit") {
        toastStore.getState().removeToast(toast.id);
        // Allow time for removal before promoting
        requestAnimationFrame(() => {
          toastStore.getState().promoteFromQueue();
        });
      }
    },
    [toast.id],
  );

  // ─── Timer Lifecycle (Starts when visible, clears on unmount) ──────
  useEffect(() => {
    // Only start timer if it's not a loading toast
    if (toast.type !== "loading" && toast.promiseState !== "loading") {
      startTimer(toast);
    }

    return () => {
      clearTimer(toast.id);
    };
  }, [
    toast.id,
    toast.createdAt,
    toast.duration,
    toast.type,
    toast.promiseState,
  ]);

  // ─── Progress Calculation ──────────────────────────────────────────
  const totalDuration =
    getTotalDuration(toast.id) || toastStore.getState().defaultDuration;
  // Elapsed time percentage (starts from 0 and grows to 100)
  const percent =
    totalDuration > 0
      ? ((totalDuration - remainingTime) / totalDuration) * 100
      : 0;
  const showTimers =
    !isStopped &&
    toast.duration !== Infinity &&
    toast.duration !== 0 &&
    remainingTime > 0;
  // ─── Render icon ───────────────────────────────────────────────────
  const IconComponent =
    toast.icon ?? (ICON_MAP[toast.type] ? ICON_MAP[toast.type]() : null);
  const showCustomIcon = toast.icon !== undefined;

  // ─── CSS classes ───────────────────────────────────────────────────
  const classNames = [
    "flux-toast",
    `flux-toast--${toast.type}`,
    `flux-toast--pattern-${pattern}`,
    toast.className,
    headless ? "flux-toast--headless" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      ref={toastRef}
      className={classNames}
      role={getAriaRole(toast.type)}
      aria-live={getAriaLive(toast.type)}
      aria-atomic="true"
      tabIndex={0}
      layout="position"
      initial={enterAnim.initial}
      animate={enterAnim.animate}
      exit={exitAnim.exit}
      transition={{ ...enterAnim.transition, layout: layoutTransition }}
      onAnimationComplete={handleAnimationComplete}
      // Drag for swipe dismiss
      drag={isHorizontal ? "x" : "y"}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.5}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      // Hover
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Keyboard
      onKeyDown={handleKeyDown}
    >
      {pattern === "dash-node" && <NodeLinesPattern />}
      {pattern === "dots" && <DotsPattern />}

      <div className="flux-toast-header">
        {/* Icon */}
        {(showCustomIcon || IconComponent) && (
          <div className="flux-toast-icon-wrapper" aria-hidden="true">
            {showCustomIcon ? toast.icon : IconComponent}
          </div>
        )}

        {/* Title */}
        <div className="flux-toast-title-wrapper">
          {toast.content
            ? toast.content
            : toast.title && (
                <div className="flux-toast-title">{toast.title}</div>
              )}
        </div>

        {/* Count badge */}
        {toast.count > 1 && (
          <motion.span
            className="flux-toast-badge"
            key={toast.count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            aria-label={`${toast.count} notifications`}
          >
            {toast.count}
          </motion.span>
        )}

        {/* No Expand/Collapse buttons anymore */}

        {/* Close button */}
        {toast.dismissible !== false && (
          <button
            className="flux-toast-btn flux-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            aria-label="Dismiss notification"
            type="button"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpandable && expanded && (
          <motion.div
            key="flux-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flux-toast-body-wrapper"
          >
            <div className="flux-toast-body">
              {toast.description && (
                <div className="flux-toast-description">
                  {toast.description}
                </div>
              )}
              {toast.action && (
                <button
                  className="flux-toast-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.action!.onClick();
                    onDismiss(toast.id);
                  }}
                  type="button"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {showTimers && (
          <motion.div
            key="flux-footer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flux-toast-footer-wrapper"
          >
            <div className="flux-toast-footer">
              <span className="flux-toast-timer-text">
                This message will close in{" "}
                <strong>{Math.ceil(remainingTime / 1000)}</strong> seconds.
              </span>
              <button className="flux-toast-stop-btn" onClick={handleStop}>
                Click to stop.
              </button>
            </div>
          </motion.div>
        )}

        {showTimers && (
          <motion.div
            key="flux-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flux-toast-progress-bar"
            style={{ width: `${Math.max(0, percent)}%` }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});
