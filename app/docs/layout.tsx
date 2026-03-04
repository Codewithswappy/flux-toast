"use client";

import "../docs.css";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { IconSearch, IconCommand, IconMenu2, IconX } from "@tabler/icons-react";
import { FluxLogo } from "@/components/FluxLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const SIDEBAR = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "installation", label: "Installation" },
      { id: "quick-start", label: "Quick Start" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "toast-api", label: "toast()" },
      { id: "promise-api", label: "toast.promise()" },
      { id: "update-api", label: "toast.update()" },
      { id: "dismiss-api", label: "toast.dismiss()" },
    ],
  },
  {
    title: "Components",
    items: [
      { id: "provider", label: "ToastProvider" },
      { id: "viewport", label: "ToastViewport" },
    ],
  },
  {
    title: "Guides",
    items: [
      { id: "positioning", label: "Positioning" },
      { id: "theming", label: "Theming" },
      { id: "custom-jsx", label: "Custom Content" },
    ],
  },
];

const FLAT_ITEMS = SIDEBAR.flatMap((s) =>
  s.items.map((i) => ({ ...i, desc: "", group: s.title })),
);

// Descriptions for search
const ITEM_DESCS: Record<string, string> = {
  introduction: "What is flux-toast and how it works",
  installation: "npm, yarn, pnpm and peer dependencies",
  "quick-start": "3-step guide to get running",
  "toast-api": "Core function and type variants",
  "promise-api": "Track async operations",
  "update-api": "Mutate existing toasts",
  "dismiss-api": "Remove toasts programmatically",
  provider: "Global configuration context",
  viewport: "Render target for toast queue",
  positioning: "Screen coordinates and origins",
  theming: "Dark mode and color variables",
  "custom-jsx": "Rendering pure React nodes",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [active, setActive] = useState("introduction");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cur = document.documentElement.getAttribute("data-theme");
    if (cur === "dark" || cur === "light") setTheme(cur);
    else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("docs-nav", { detail: active }));
  }, [active]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearchQuery("");
  }, [searchOpen]);

  const filteredItems = FLAT_ITEMS.filter((item) => {
    const q = searchQuery.toLowerCase();
    const desc = ITEM_DESCS[item.id] || "";
    return (
      item.label.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="docs-page">
      {/* ── Search Modal ──────────────────────────────────────── */}
      <div
        className={`docs-search-overlay ${searchOpen ? "open" : ""}`}
        onClick={() => setSearchOpen(false)}
      >
        <div className="docs-search-modal" onClick={(e) => e.stopPropagation()}>
          <div className="docs-search-header">
            <IconSearch size={16} className="docs-search-icon" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation…"
              className="docs-search-input"
            />
            <button
              className="docs-search-esc"
              onClick={() => setSearchOpen(false)}
            >
              ESC
            </button>
          </div>
          <div className="docs-search-body">
            {filteredItems.length === 0 ? (
              <div className="docs-search-empty">
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <ul>
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActive(item.id);
                        setSearchOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <div className="ds-item-main">
                        <span className="ds-item-label">{item.label}</span>
                        <span className="ds-item-desc">
                          {ITEM_DESCS[item.id] || ""}
                        </span>
                      </div>
                      <span className="ds-item-group">{item.group}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="docs-topbar">
        <button
          className="docs-mobile-menu-btn"
          onClick={() => setMobileNav((v) => !v)}
          aria-label={mobileNav ? "Close menu" : "Open menu"}
        >
          {mobileNav ? <IconX size={18} /> : <IconMenu2 size={18} />}
        </button>
        <Link href="/" className="docs-logo">
          <FluxLogo />
          Flux
        </Link>
        <nav className="docs-top-nav docs-desktop-only">
          <Link href="/">Home</Link>
          <Link href="/docs" className="docs-active">
            Docs
          </Link>
          <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center" />
          <a
            href="https://github.com/Codewithswappy/flux-toast"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <a href="https://x.com/heyyswap" target="_blank" rel="noopener">
            Twitter
          </a>
        </nav>
        <button
          className="docs-search-trigger docs-desktop-only"
          onClick={() => setSearchOpen(true)}
        >
          <IconSearch size={14} />
          <span>Search…</span>
          <div className="docs-kbd">
            <IconCommand size={11} /> K
          </div>
        </button>
        <ThemeToggle
          theme={theme}
          toggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="theme-toggle"
        />
      </header>

      {/* ── Mobile Bottom Sheet ────────────────────────────────── */}
      <div
        className={`docs-mobile-overlay ${mobileNav ? "open" : ""}`}
        onClick={() => setMobileNav(false)}
      />
      <div className={`docs-mobile-sheet ${mobileNav ? "open" : ""}`}>
        <div className="docs-mobile-sheet-handle" />
        <nav className="docs-mobile-sheet-nav">
          <div className="docs-mobile-nav-top docs-mobile-only">
            <button
              className="docs-mobile-search-btn"
              onClick={() => {
                setSearchOpen(true);
                setMobileNav(false);
              }}
            >
              <IconSearch size={15} />
              <span>Search documentation…</span>
            </button>
            <div className="docs-mobile-links">
              <Link href="/" onClick={() => setMobileNav(false)}>
                Home
              </Link>
              <Link
                href="/docs"
                className="active"
                onClick={() => setMobileNav(false)}
              >
                Docs
              </Link>
              <a
                href="https://github.com/Codewithswappy/flux-toast"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
              <a href="https://x.com/heyyswap" target="_blank" rel="noopener">
                Twitter
              </a>
            </div>
          </div>
          {SIDEBAR.map((s) => (
            <div className="docs-sidebar-group" key={s.title}>
              <div className="docs-sidebar-label">{s.title}</div>
              <ul>
                {s.items.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`docs-sidebar-btn ${active === item.id ? "active" : ""}`}
                      onClick={() => {
                        setActive(item.id);
                        setMobileNav(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="docs-body">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="docs-sidebar">
          {SIDEBAR.map((s) => (
            <div className="docs-sidebar-group" key={s.title}>
              <div className="docs-sidebar-label">{s.title}</div>
              <ul>
                {s.items.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`docs-sidebar-btn ${active === item.id ? "active" : ""}`}
                      onClick={() => {
                        setActive(item.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* ── Main ─────────────────────────────────────────────── */}
        <main className="docs-main">{children}</main>
      </div>
    </div>
  );
}
