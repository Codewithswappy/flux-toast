"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconMessageCircle,
  IconSparkles,
  IconRefresh,
  IconPalette,
  IconCopy,
  IconTrash,
  IconBrandGithub,
  IconArrowRight,
  IconBook,
  IconSend,
  IconNote,
  IconMaximize,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FluxLogo } from "@/components/FluxLogo";
import {
  toast,
  ToastProvider,
  ToastViewport,
  useToast,
  type ToastPosition,
} from "@flux-ui/toast";

// ─── Constants ──────────────────────────────────────────────────────────────

const POSITIONS: { label: string; value: ToastPosition }[] = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Top Right", value: "top-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Right", value: "bottom-right" },
];

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Background ─────────────────────────────────────────────────────────────

function BackgroundPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_50%,transparent_100%)]" />
      <div className="hero-orb-1 absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-zinc-300/20 dark:bg-zinc-700/10 blur-[160px]" />
      <div className="hero-orb-2 absolute top-[15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-zinc-400/15 dark:bg-zinc-600/8 blur-[140px]" />
    </div>
  );
}

// ─── Hero Code Preview ──────────────────────────────────────────────────────

function HeroCodeBlock() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.7,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -8, filter: "blur(2px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.45, ease }}
      className="relative w-full max-w-md"
    >
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 ml-2 tracking-wide uppercase">
            App.tsx
          </span>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="p-5 hero-code overflow-x-auto"
        >
          <motion.div variants={item}>
            <span className="token-keyword">import</span>{" "}
            <span className="token-punctuation">{"{"}</span>{" "}
            <span className="token-property">toast</span>{" "}
            <span className="token-punctuation">{"}"}</span>{" "}
            <span className="token-keyword">from</span>{" "}
            <span className="token-string">&quot;@flux-ui/toast&quot;</span>
          </motion.div>
          <motion.div variants={item} className="mt-3">
            <span className="token-comment">
              {"// One line — instant feedback"}
            </span>
          </motion.div>
          <motion.div variants={item}>
            <span className="token-function">toast</span>
            <span className="token-punctuation">.</span>
            <span className="token-function">success</span>
            <span className="token-punctuation">(</span>
            <span className="token-string">&quot;Deployed to prod&quot;</span>
            <span className="token-punctuation">)</span>
          </motion.div>
          <motion.div variants={item} className="mt-3">
            <span className="token-comment">{"// Promise lifecycle"}</span>
          </motion.div>
          <motion.div variants={item}>
            <span className="token-function">toast</span>
            <span className="token-punctuation">.</span>
            <span className="token-function">promise</span>
            <span className="token-punctuation">(</span>
            <span className="token-function">deploy</span>
            <span className="token-punctuation">()</span>
            <span className="token-punctuation">,</span>{" "}
            <span className="token-punctuation">{"{"}</span>
          </motion.div>
          <motion.div variants={item}>
            &nbsp;&nbsp;<span className="token-property">loading</span>
            <span className="token-punctuation">:</span>{" "}
            <span className="token-string">&quot;Building…&quot;</span>
            <span className="token-punctuation">,</span>
          </motion.div>
          <motion.div variants={item}>
            &nbsp;&nbsp;<span className="token-property">success</span>
            <span className="token-punctuation">:</span>{" "}
            <span className="token-string">&quot;Live on edge&quot;</span>
            <span className="token-punctuation">,</span>
          </motion.div>
          <motion.div variants={item}>
            &nbsp;&nbsp;<span className="token-property">error</span>
            <span className="token-punctuation">:</span>&nbsp;&nbsp;
            <span className="token-string">&quot;Build failed&quot;</span>
          </motion.div>
          <motion.div variants={item}>
            <span className="token-punctuation">{"}"}</span>
            <span className="token-punctuation">)</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Install Bar ────────────────────────────────────────────────────────────

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @flux-ui/toast");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.38, ease }}
      onClick={handleCopy}
      className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-800 text-sm cursor-pointer hover:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
      aria-label="Copy install command"
    >
      <span className="text-zinc-500 select-none font-mono">$</span>
      <span className="text-zinc-200 dark:text-zinc-300 font-mono">
        npm install <span className="text-zinc-400">@flux-ui/toast</span>
      </span>
      <span className="ml-1 text-[11px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
        {copied ? "✓" : "Copy"}
      </span>
    </motion.button>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <header className="relative px-6 pt-32 pb-16 md:pt-40 md:pb-24 mx-auto max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 text-[11px] font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            v1.0 Stable
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease }}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-[-0.03em] mb-5 text-zinc-900 dark:text-white leading-[1.1] font-display"
          >
            Toast notifications,
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">perfected.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease }}
            className="text-base text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed"
          >
            A notification system for React — accessible, animated, and
            engineered for zero re-renders. TypeScript-first. SSR-safe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="flex items-center gap-3 mb-8"
          >
            <a
              href="#demo"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              View Demo <IconArrowRight size={15} />
            </a>
            <a
              href="/docs"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <IconBook size={15} /> Docs
            </a>
          </motion.div>

          <InstallCommand />
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroCodeBlock />
        </div>
      </div>
    </header>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="fixed top-0 inset-x-0 z-50 h-14 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/40"
    >
      <div className="max-w-6xl mx-auto w-full h-full flex items-center justify-between px-6">
        <a
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-md p-1 -ml-1"
        >
          <FluxLogo />
          <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
            Flux
          </span>
        </a>
        <div className="flex items-center gap-1">
          <a
            href="/docs"
            className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            Docs
          </a>
          <a
            href="https://github.com/Codewithswappy/flux-toast"
            target="_blank"
            rel="noopener"
            className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            GitHub
          </a>
          <a
            href="https://x.com/heyyswap"
            target="_blank"
            rel="noopener"
            className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            Twitter
          </a>
          <div className="ml-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Demo Content ───────────────────────────────────────────────────────────

function DemoContent() {
  const [position, setPosition] = useState<ToastPosition>("bottom-right");
  const { toasts, queueCount } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
      document.documentElement.classList.add("dark", "color-scheme-dark");
      document.documentElement.classList.remove("light", "color-scheme-light");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark", "color-scheme-dark");
      document.documentElement.classList.add("light", "color-scheme-light");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const isDark = prev !== "dark";
      if (isDark) {
        document.documentElement.classList.add("dark", "color-scheme-dark");
        document.documentElement.classList.remove(
          "light",
          "color-scheme-light",
        );
        return "dark";
      } else {
        document.documentElement.classList.remove("dark", "color-scheme-dark");
        document.documentElement.classList.add("light", "color-scheme-light");
        return "light";
      }
    });
  }, []);

  const handlePromise = useCallback(() => {
    const p = new Promise<{ id: number }>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.2
          ? resolve({ id: 8492 })
          : reject(new Error("Deploy failed"));
      }, 2000);
    });
    toast.promise(p, {
      loading: "Deploying to production…",
      success: (data) => `Successfully deployed build #${data.id}`,
      error: (err) =>
        `Deploy error: ${err instanceof Error ? err.message : "Network issue"}`,
    });
  }, []);

  const handleUpdate = useCallback(() => {
    const id = toast.loading("Processing image optimization…");
    setTimeout(() => {
      toast.update(id, {
        type: "success",
        title: "Optimization Complete",
        description: "Saved 2.4 MB on 12 images.",
        duration: 4000,
      });
    }, 2500);
  }, []);

  const handleExpandable = useCallback(() => {
    toast({
      title: "Confirm Deletion",
      type: "warning",
      description:
        "Are you certain you wish to erase this document? This action is irreversible and affects all collaborators.",
      duration: 15000,
      action: {
        label: "Erase",
        onClick: () => toast.success("Document securely erased."),
      },
    });
  }, []);

  const handleCustomJSX = useCallback(() => {
    toast({
      type: "info",
      content: (
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm mb-0.5 text-zinc-900 dark:text-zinc-100 truncate">
            Update Available
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            flux-toast v2.0 is out with new features.
          </p>
        </div>
      ),
      duration: 15000,
    });
  }, []);

  return (
    <>
      <ToastViewport position={position} />
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 relative z-0 transition-colors duration-200 overflow-x-hidden">
        <BackgroundPattern />
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Hero />

        <main className="max-w-4xl mx-auto px-6 space-y-24">
          {/* ── Core Variants ─────────────────────────────────────── */}
          <section id="demo" className="scroll-mt-28">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold font-display tracking-tight text-zinc-900 dark:text-white mb-1">
                Core Variants
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-8">
                Four distinct notification types for every situation.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Success",
                  icon: IconCheck,
                  handler: () => toast.success("Configuration saved"),
                },
                {
                  label: "Error",
                  icon: IconX,
                  handler: () =>
                    toast.error({
                      title: "Auth Failed",
                      description: "Invalid session token.",
                    }),
                },
                {
                  label: "Warning",
                  icon: IconAlertTriangle,
                  handler: () => toast.warning("Rate limit: 45/50 requests"),
                },
                {
                  label: "Default",
                  icon: IconMessageCircle,
                  handler: () => toast("Profile data synced"),
                },
              ].map(({ label, icon: Icon, handler }, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handler}
                  className="group flex flex-col items-center gap-3 py-8 px-4 rounded-xl border border-zinc-150 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <Icon
                    size={22}
                    className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                  />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ── Advanced ──────────────────────────────────────────── */}
          <section className="scroll-mt-28">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold font-display tracking-tight text-zinc-900 dark:text-white mb-1">
                Advanced
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-8">
                Promise tracking, live updates, expandable content, and custom
                JSX.
              </p>
            </motion.div>

            <div className="space-y-3">
              {[
                {
                  title: "Promise Lifecycle",
                  desc: "Orchestrate loading → success → error from any async operation.",
                  icon: IconSparkles,
                  handler: handlePromise,
                },
                {
                  title: "Live Updates",
                  desc: "Mutate an existing toast's content by ID while it's visible.",
                  icon: IconRefresh,
                  handler: handleUpdate,
                },
                {
                  title: "Expandable",
                  desc: "Long descriptions with embedded action buttons.",
                  icon: IconMaximize,
                  handler: handleExpandable,
                },
                {
                  title: "Custom JSX",
                  desc: "Render any React component as toast content.",
                  icon: IconPalette,
                  handler: handleCustomJSX,
                },
              ].map(({ title, desc, icon: Icon, handler }, i) => (
                <motion.button
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handler}
                  className="group w-full flex items-center gap-5 py-5 px-6 rounded-xl border border-zinc-150 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <Icon
                    size={20}
                    className="shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5 tracking-tight">
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <IconArrowRight
                    size={14}
                    className="shrink-0 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all"
                  />
                </motion.button>
              ))}
            </div>

            {/* Queue Controls */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.16, ease }}
              className="mt-3 flex items-center gap-3 py-5 px-6 rounded-xl border border-zinc-150 dark:border-zinc-800/60 bg-white dark:bg-zinc-950"
            >
              <IconTrash
                size={20}
                className="shrink-0 text-zinc-400 dark:text-zinc-500"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5 tracking-tight">
                  Queue Control
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                  Duplicate grouping enforced. Push to queue or clear all.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.info("Task added to queue")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  aria-label="Add to queue"
                >
                  <IconCopy size={13} /> Add
                </button>
                <button
                  onClick={() => toast.clear()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  aria-label="Clear queue"
                >
                  <IconTrash size={13} /> Clear
                </button>
              </div>
            </motion.div>

            {/* Status */}
            <div
              className={`mt-4 flex items-center justify-center gap-4 text-xs text-zinc-400 dark:text-zinc-600 transition-opacity duration-300 ${toasts.length > 0 || queueCount > 0 ? "opacity-100" : "opacity-0"}`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {toasts.length} active
              </span>
              {queueCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  {queueCount} queued
                </span>
              )}
            </div>
          </section>

          {/* ── Position ──────────────────────────────────────────── */}
          <section className="scroll-mt-28">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold font-display tracking-tight text-zinc-900 dark:text-white mb-1">
                Position
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-8">
                Dock notifications to any corner or edge.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease }}
              className="max-w-md mx-auto"
            >
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    className={`px-3 py-3 rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                      position === value
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                    onClick={() => {
                      setPosition(value);
                      toast.success({
                        title: `Position: ${label}`,
                        duration: 1500,
                      });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ── Footer ────────────────────────────────────────────── */}
          <footer className="pt-16 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-col items-center gap-5">
              <div className="flex items-center gap-2">
                <FluxLogo />
                <span className="text-sm font-bold font-display text-zinc-900 dark:text-white tracking-tight">
                  flux-toast
                </span>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center max-w-sm">
                A meticulously crafted toast notification library for modern
                React applications. Open source, free forever.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <a
                  href="/docs"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
                >
                  Docs
                </a>
                <a
                  href="https://github.com/Codewithswappy/flux-toast"
                  target="_blank"
                  rel="noopener"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  GitHub
                </a>
                <a
                  href="https://x.com/heyyswap"
                  target="_blank"
                  rel="noopener"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  Twitter
                </a>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Built with love by{" "}
                <a
                  href="https://x.com/heyyswap"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-zinc-900 dark:hover:text-white underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4"
                >
                  @heyyswap
                </a>
              </p>
              <p className="text-[11px] text-zinc-300 dark:text-zinc-800 pb-8">
                MIT · TypeScript · React 18+
              </p>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}

// ─── Entry ──────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <ToastProvider
      maxVisible={5}
      defaultDuration={15000}
      groupDuplicates={true}
      theme="system"
    >
      <DemoContent />
    </ToastProvider>
  );
}
