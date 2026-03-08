import type { ToastPosition } from "../core/types";
import { prefersReducedMotion } from "./accessibility";

// ─── Slide directions based on position ──────────────────────────────────────

function getSlideDirection(position: ToastPosition): { x: number; y: number } {
  if (position.includes("right")) return { x: 100, y: 0 };
  if (position.includes("left")) return { x: -100, y: 0 };
  if (position.startsWith("top")) return { x: 0, y: -80 };
  return { x: 0, y: 80 };
}

// ─── Enter Animation Variants ────────────────────────────────────────────────

export function getEnterAnimation(position: ToastPosition) {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15 },
    };
  }

  const { x, y } = getSlideDirection(position);

  return {
    initial: { 
      opacity: 0, 
      scale: 0.9, 
      y: position.startsWith("top") ? -10 : 10,
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
    },
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      mass: 0.7,
    },
  };
}

// ─── Exit Animation Variants ─────────────────────────────────────────────────

export function getExitAnimation(position: ToastPosition) {
  if (prefersReducedMotion()) {
    return {
      exit: { opacity: 0 },
      transition: { duration: 0.1 },
    };
  }

  const { x, y } = getSlideDirection(position);

  return {
    exit: {
      opacity: 0,
      scale: 0.85,
      transition: {
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
      },
    },
  };
}

// ─── Swipe Dismiss Config ────────────────────────────────────────────────────

export function getSwipeDismissConfig(position: ToastPosition) {
  const isRight = position.includes("right");
  const isLeft = position.includes("left");
  const isCenter = position.includes("center");

  return {
    drag: (isCenter ? "y" : "x") as "x" | "y",
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.6,
    dragSnapToOrigin: true,
    swipeThreshold: 80,
    getSwipeDirection: () => {
      if (isRight) return "right";
      if (isLeft) return "left";
      if (position.startsWith("top")) return "up";
      return "down";
    },
  };
}

// ─── Layout Animation ────────────────────────────────────────────────────────

export const layoutTransition = {
  type: "spring" as const,
  stiffness: 450,
  damping: 40,
  mass: 1,
};
