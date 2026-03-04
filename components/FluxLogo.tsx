"use client";

import { motion } from "motion/react";

export function FluxLogo({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={`shrink-0 flex items-center justify-center cursor-pointer ${className}`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-900 dark:text-zinc-50 overflow-visible"
      >
        {/* Stacked Back Toast (Bottom) */}
        <motion.rect
          x="6"
          y="16"
          width="12"
          height="4"
          rx="2"
          opacity="0.25"
          initial={{ y: -8, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 0.25, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
        />
        {/* Stacked Middle Toast */}
        <motion.rect
          x="4"
          y="12"
          width="16"
          height="6"
          rx="2"
          opacity="0.5"
          initial={{ y: -8, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 0.5, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        />
        {/* Main Front Toast */}
        <motion.rect
          x="2"
          y="6"
          width="20"
          height="10"
          rx="3"
          initial={{ y: -8, opacity: 0, scale: 1 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3,
          }}
          className="fill-white dark:fill-zinc-950"
        />

        {/* Inner element (check mark) */}
        <motion.path
          d="M7 11l2.5 2.5 4-4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          stroke="currentColor"
        />

        {/* Pulse Dot (Flux movement indicator) */}
        <motion.circle
          cx="22"
          cy="4"
          r="2.5"
          fill="currentColor"
          stroke="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 15,
            delay: 0.8,
          }}
        />
      </svg>
    </motion.div>
  );
}
