"use client";

import React, { useState, useEffect } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  UTILITIES                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

function highlight(code: string) {
  const hl = code
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\/\/.*)/g, "§§cm§§$1§§/span§§")
    .replace(
      /(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`|".*?"|'.*?')/g,
      "§§cs§§$1§§/span§§",
    )
    .replace(/\b(\d+|Infinity)\b/g, "§§cn§§$1§§/span§§")
    .replace(
      /\b(import|from|export|default|function|const|let|await|return|try|catch|async|if|else|while|for|type|interface|class|new|typeof|boolean|string|number)\b/g,
      "§§ck§§$1§§/span§§",
    )
    .replace(
      /\b(toast|success|error|warning|info|loading|promise|update|dismiss|clear|fetch|console|log|saveData|deleteUser|ToastProvider|ToastViewport|SaveButton|RootLayout)\b/g,
      "§§cf§§$1§§/span§§",
    )
    .replace(/§§(.*?)§§/g, (m, p1) =>
      p1 === "/span" ? "</span>" : `<span class="${p1}">`,
    );
  return { __html: hl };
}

function Code({
  file,
  lang,
  children,
}: {
  file?: string;
  lang?: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-codeblock">
      <button
        className={`docs-copy-btn ${copied ? "copied" : ""}`}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
      {(file || lang) && (
        <div className="docs-codeblock-header">
          {file && <span className="docs-codeblock-file">{file}</span>}
          {lang && <span className="docs-codeblock-lang">{lang}</span>}
        </div>
      )}
      <pre dangerouslySetInnerHTML={highlight(children)} />
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-callout docs-callout--tip">
      <div className="docs-callout-icon">✓</div>
      <div>{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-callout docs-callout--note">
      <div className="docs-callout-icon">i</div>
      <div>{children}</div>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="docs-step">
      <div className="docs-step-num">{n}</div>
      <div className="docs-step-body">
        <div className="docs-step-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

function Param({
  name,
  type,
  req,
  children,
  def,
  enums,
}: {
  name: string;
  type: string;
  req?: boolean;
  children?: React.ReactNode;
  def?: string;
  enums?: string[];
}) {
  return (
    <div className="docs-param">
      <div className="docs-param-row">
        <span className="docs-pn">{name}</span>
        <span className="docs-pt">{type}</span>
        {req !== undefined && (
          <span className={`docs-pb ${req ? "docs-pb--req" : "docs-pb--opt"}`}>
            {req ? "required" : "optional"}
          </span>
        )}
      </div>
      {children && <p className="docs-pd">{children}</p>}
      {def && (
        <p className="docs-pdefault">
          Default: <code>{def}</code>
        </p>
      )}
      {enums && (
        <div className="docs-penum">
          {enums.map((e) => (
            <code key={e}>{e}</code>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SECTIONS                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

function Introduction() {
  return (
    <div className="docs-content">
      <h1>Introduction</h1>
      <p className="docs-lead">
        flux-toast is a complete toast notification system for React and
        Next.js. TypeScript-first, SSR-safe, zero unnecessary re-renders, and
        ships with animated icons and progress timers out of the box.
      </p>

      <h2 id="what-is-flux-toast" className="docs-sh">
        What is flux-toast
      </h2>
      <p className="docs-pd" style={{ marginBottom: 16 }}>
        A single function call — <code>toast(&quot;Done!&quot;)</code> — is all
        you need to show a notification. It handles positioning, stacking,
        animations, queuing, duplicate grouping, accessibility announcements,
        and auto-dismiss timers automatically.
      </p>

      <Code lang="tsx">{`import { toast } from "@flux-ui/toast";

// That's it. One line.
toast("Changes saved successfully");

// Or with a type
toast.success("Profile updated");
toast.error("Something went wrong");`}</Code>

      <h2 id="features" className="docs-sh">
        Features
      </h2>

      <Tip>
        <p>
          All features are opt-in. The simplest usage is just{" "}
          <code>toast(&quot;message&quot;)</code>.
        </p>
      </Tip>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 6,
          marginBottom: 24,
        }}
      >
        {[
          ["Expandable body", "Collapsed by default, expand for details"],
          ["Progress timers", "Animated bar + countdown on hover"],
          ["Queue system", "maxVisible limit, FIFO promotion"],
          ["Promise tracking", "Loading → success/error transitions"],
          ["Duplicate grouping", "Identical toasts merge with count badge"],
          ["6 positions", "Top/bottom × left/center/right"],
          ["Dark mode", "System, light, or dark theme presets"],
          ["SSR safe", "Works seamlessly with Next.js App Router"],
          ["Accessible", "ARIA live regions + screen reader compatible"],
          ["Swipe dismiss", "Mobile-friendly gesture support built-in"],
        ].map(([title, desc]) => (
          <div
            key={title}
            style={{
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--fg)",
                marginBottom: 2,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{desc}</div>
          </div>
        ))}
      </div>

      <h2 id="how-it-works" className="docs-sh">
        How it works
      </h2>
      <p className="docs-pd">
        The library uses a vanilla Zustand store for global state. Components
        subscribe via React 18&apos;s <code>useSyncExternalStore</code>.
        Animations are powered by the <code>motion</code> library
        (framer-motion). Toast icons are animated SVGs drawn with path
        animations for a polished feel.
      </p>
    </div>
  );
}

function Installation() {
  return (
    <div className="docs-content">
      <h1>Installation</h1>
      <p className="docs-lead">
        Install via your preferred package manager, then import the required
        styles.
      </p>

      <h2 id="package-managers" className="docs-sh">
        Package managers
      </h2>

      <Code file="Terminal" lang="npm">{`npm install @flux-ui/toast`}</Code>
      <Code file="Terminal" lang="yarn">{`yarn add @flux-ui/toast`}</Code>
      <Code file="Terminal" lang="pnpm">{`pnpm add @flux-ui/toast`}</Code>

      <h2 id="peer-dependencies" className="docs-sh">
        Peer dependencies
      </h2>
      <p className="docs-pd" style={{ marginBottom: 16 }}>
        These must be present in your project. If you&apos;re using Next.js, you
        likely have them already.
      </p>

      <Code file="Terminal">{`npm install react react-dom motion zustand`}</Code>

      <div style={{ marginTop: 16 }}>
        <Param name="react" type=">= 18.0.0">
          React with concurrent features.
        </Param>
        <Param name="react-dom" type=">= 18.0.0">
          DOM renderer.
        </Param>
        <Param name="motion" type=">= 11.0.0">
          Animation library (framer-motion).
        </Param>
        <Param name="zustand" type=">= 4.0.0">
          Lightweight state management.
        </Param>
      </div>

      <h2 id="import-styles" className="docs-sh">
        Import styles
      </h2>
      <p className="docs-pd" style={{ marginBottom: 12 }}>
        Add the CSS import to your root layout or global styles entrypoint.
      </p>

      <Code file="app/layout.tsx" lang="tsx">{`import "@flux-ui/toast/styles";

// Optional: includes default light + dark theme variables
import "@flux-ui/toast/themes";`}</Code>

      <Tip>
        <p>
          If you opt into <code>headless</code> mode on ToastProvider, you
          don&apos;t need to import any CSS.
        </p>
      </Tip>
    </div>
  );
}

function QuickStart() {
  return (
    <div className="docs-content">
      <h1>Quick Start</h1>
      <p className="docs-lead">
        Get the notification system rendering in 3 steps. Takes under a minute.
      </p>

      <h2
        id="step-1---provider"
        className="docs-sh"
        style={{ border: "none", margin: 0, padding: 0 }}
      ></h2>
      <Step n={1} title="Wrap your app with ToastProvider">
        <p>
          Add <code>ToastProvider</code> and <code>ToastViewport</code> to your
          root layout. The provider configures behavior, the viewport renders
          the toast stack.
        </p>
        <Code
          file="app/layout.tsx"
          lang="tsx"
        >{`import { ToastProvider, ToastViewport } from "@flux-ui/toast";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider defaultDuration={15000} maxVisible={5}>
          {children}
          <ToastViewport position="bottom-right" />
        </ToastProvider>
      </body>
    </html>
  );
}`}</Code>
      </Step>

      <h2
        id="step-2---dispatch"
        className="docs-sh"
        style={{ border: "none", margin: 0, padding: 0 }}
      ></h2>
      <Step n={2} title="Dispatch toasts from anywhere">
        <p>
          Import <code>toast</code> and call it. No hooks required — it works
          inside and outside React components.
        </p>
        <Code file="components/SaveButton.tsx" lang="tsx">{`"use client";
import { toast } from "@flux-ui/toast";

export function SaveButton() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success("Changes saved!");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`}</Code>
      </Step>

      <h2
        id="step-3---customize"
        className="docs-sh"
        style={{ border: "none", margin: 0, padding: 0 }}
      ></h2>
      <Step n={3} title="Customize to your needs">
        <p>
          Use the options object to add descriptions, interactive actions,
          custom durations, and callbacks.
        </p>
        <Code file="example.tsx" lang="tsx">{`toast({
  title: "File uploaded",
  description: "report-2024.pdf was uploaded to your workspace.",
  type: "success",
  duration: 8000,
  action: {
    label: "View file",
    onClick: () => router.push("/files"),
  },
});`}</Code>
      </Step>

      <Note>
        <p>
          The <code>toast()</code> function returns a unique string ID. Hold
          onto it to update or dismiss the toast via{" "}
          <code>toast.update(id)</code> or <code>toast.dismiss(id)</code>.
        </p>
      </Note>
    </div>
  );
}

function ToastAPI() {
  return (
    <div className="docs-content">
      <h1>toast()</h1>
      <p className="docs-lead">
        The core function for creating notifications. Pass a string for a quick
        message, or an options object for full control.
      </p>

      <h2 id="basic-usage" className="docs-sh">
        Basic usage
      </h2>
      <Code lang="tsx">{`// Simple string defaults to the 'info' variant
toast("Hello world");

// Pass an object for a description
toast({
  title: "Deployment started",
  description: "Building your project. This may take a few minutes.",
});`}</Code>

      <h2 id="with-options" className="docs-sh">
        With options
      </h2>
      <Code lang="tsx">{`toast({
  title: "Remove user?",
  description: "This action cannot be undone. The user will lose access.",
  type: "warning",
  duration: 15000,
  action: {
    label: "Confirm",
    onClick: () => deleteUser(userId),
  },
  onDismiss: (t) => console.log("Dismissed:", t.id),
});`}</Code>

      <h2 id="type-variants" className="docs-sh">
        Type variants
      </h2>
      <p className="docs-pd" style={{ marginBottom: 12 }}>
        Shorthand methods that preset the <code>type</code> field. They share
        the same signature: <code>string | ToastInput</code>.
      </p>
      <Code lang="tsx">{`toast.success("Saved!");
toast.error("Connection failed");
toast.warning("Disk space low");
toast.info("New version available");
toast.loading("Uploading..."); // Note: loading toasts do NOT auto-dismiss`}</Code>

      <Note>
        <p>
          <code>toast.loading()</code> uses an <code>Infinity</code> duration.
          You must update or dismiss it programmatically when work finishes.
        </p>
      </Note>

      <h2 id="all-parameters" className="docs-sh">
        All parameters
      </h2>
      <Param name="title" type="string">
        Primary headline text.
      </Param>
      <Param name="description" type="string | ReactNode">
        Secondary text shown inside the expandable body.
      </Param>
      <Param
        name="type"
        type="ToastType"
        enums={["success", "error", "warning", "info", "loading"]}
      >
        Visual variant controlling the icon, border color, and progress
        semantics.
      </Param>
      <Param name="duration" type="number" def="inherited from provider">
        Time in milliseconds before the toast auto-dismisses.
      </Param>
      <Param name="action" type="{ label, onClick }">
        Configuration to render a CTA button inside the expanded area.
      </Param>
      <Param name="icon" type="ReactNode">
        Custom icon replacing the default animated variant.
      </Param>
      <Param name="content" type="ReactNode">
        Replaces the entire toast body with custom JSX. Ignores title and
        description when set.
      </Param>
      <Param name="dismissible" type="boolean" def="true">
        Whether the close button is shown.
      </Param>
      <Param name="pauseOnHover" type="boolean" def="true">
        Pauses auto-dismiss timer while hovering.
      </Param>
      <Param name="onDismiss" type="(toast) => void">
        Called when manually dismissed or dismissed via API.
      </Param>
      <Param name="onAutoClose" type="(toast) => void">
        Called when the timer expires naturally.
      </Param>
      <Param name="className" type="string">
        CSS class applied to the outer toast wrapper.
      </Param>
      <Param name="id" type="string">
        Custom ID for the toast instance.
      </Param>

      <h2 id="return-value" className="docs-sh">
        Return value
      </h2>
      <Param name="id" type="string">
        Unique toast identifier. Use with <code>toast.update</code> or{" "}
        <code>toast.dismiss</code>.
      </Param>
    </div>
  );
}

function PromiseAPI() {
  return (
    <div className="docs-content">
      <h1>toast.promise()</h1>
      <p className="docs-lead">
        Automatically coordinates a Promise through loading, success, and error
        states with seamless visual transitions.
      </p>

      <h2 id="basic-usage" className="docs-sh">
        Basic usage
      </h2>
      <Code lang="tsx">{`const data = await toast.promise(
  fetch("/api/users"),
  {
    loading: "Fetching users...",
    success: "Users loaded!",
    error: "Failed to fetch users",
  }
);`}</Code>

      <h2 id="with-callback" className="docs-sh">
        With callback
      </h2>
      <p className="docs-pd" style={{ marginBottom: 12 }}>
        Use functions for <code>success</code> and <code>error</code> to include
        resolved data or error details in the message.
      </p>
      <Code lang="tsx">{`toast.promise(saveDocument(doc), {
  loading: "Saving changes...",
  success: (data) => \`Saved "\${data.title}" at \${data.updatedAt}\`,
  error: (err) => \`Save failed: \${err.message}\`,
});`}</Code>

      <h2 id="parameters" className="docs-sh">
        Parameters
      </h2>
      <Param name="promise" type="Promise<T>" req>
        The promise to track.
      </Param>
      <Param name="messages.loading" type="string | ReactNode" req>
        Displayed while the promise is pending.
      </Param>
      <Param name="messages.success" type="string | (data: T) => string" req>
        Displayed or called on fulfillment.
      </Param>
      <Param name="messages.error" type="string | (err) => string" req>
        Displayed or called on rejection.
      </Param>
      <Param name="input" type="ToastInput" req={false}>
        Additional base properties (duration, action, etc).
      </Param>

      <Tip>
        <p>
          The original promise continues its chain normally — you can safely{" "}
          <code>await</code> or append <code>.then()</code> logic.
        </p>
      </Tip>
    </div>
  );
}

function UpdateAPI() {
  return (
    <div className="docs-content">
      <h1>toast.update()</h1>
      <p className="docs-lead">
        Mutate an existing toast in-place while preserving its position in the
        stack. Ideal for async workflows transitioning from a loading state.
      </p>

      <h2 id="basic-usage" className="docs-sh">
        Basic usage
      </h2>
      <Code lang="tsx">{`// 1. Fire a loading toast
const id = toast.loading("Processing payment...");

// 2. Do async work
const result = await processPayment();

// 3. Update in-place
toast.update(id, {
  type: "success",
  title: "Payment complete!",
  description: \`Transaction \${result.transactionId} confirmed.\`,
  duration: 5000,
});`}</Code>

      <h2 id="parameters" className="docs-sh">
        Parameters
      </h2>
      <Param name="id" type="string" req>
        The toast ID to update.
      </Param>
      <Param name="data" type="ToastUpdateInput" req>
        Any standard toast property except lifecycle callbacks.
      </Param>
    </div>
  );
}

function DismissAPI() {
  return (
    <div className="docs-content">
      <h1>toast.dismiss() / toast.clear()</h1>
      <p className="docs-lead">
        Programmatically remove individual toasts or clear the entire queue.
      </p>

      <h2 id="dismiss-one" className="docs-sh">
        Dismiss one
      </h2>
      <Code lang="tsx">{`const id = toast("Processing...");

// Remove by ID
toast.dismiss(id);`}</Code>

      <h2 id="clear-all" className="docs-sh">
        Clear all
      </h2>
      <Code lang="tsx">{`// Dismiss all active toasts and clear the queue
toast.clear();

// Equivalent shorthand
toast.dismiss();`}</Code>
    </div>
  );
}

function Provider() {
  return (
    <div className="docs-content">
      <h1>ToastProvider</h1>
      <p className="docs-lead">
        Global configuration wrapper. Place once at the root of your app to
        configure defaults for all toasts.
      </p>

      <h2 id="basic-setup" className="docs-sh">
        Basic setup
      </h2>
      <Code file="app/layout.tsx" lang="tsx">{`<ToastProvider
  maxVisible={5}
  defaultDuration={15000}
  groupDuplicates={true}
  theme="system"
>
  {children}
  <ToastViewport position="bottom-right" />
</ToastProvider>`}</Code>

      <h2 id="all-props" className="docs-sh">
        All props
      </h2>
      <Param name="children" type="ReactNode" req>
        Your application tree.
      </Param>
      <Param name="defaultDuration" type="number" def="4000">
        Default auto-dismiss duration in milliseconds.
      </Param>
      <Param name="maxVisible" type="number" def="5">
        Maximum toasts visible at once. Extra toasts enter the queue.
      </Param>
      <Param name="groupDuplicates" type="boolean" def="false">
        Merge identical toasts with a count badge instead of stacking.
      </Param>
      <Param
        name="theme"
        type="string"
        def="system"
        enums={["light", "dark", "system"]}
      >
        Color theme for toast rendering.
      </Param>
      <Param
        name="position"
        type="ToastPosition"
        def="bottom-right"
        enums={[
          "top-left",
          "top-center",
          "top-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ]}
      >
        Default position if not set on ToastViewport.
      </Param>
      <Param name="headless" type="boolean" def="false">
        Disables built-in CSS. Use for fully custom styling.
      </Param>
      <Param name="gap" type="number" def="12">
        Spacing between stacked toasts in pixels.
      </Param>
    </div>
  );
}

function Viewport() {
  return (
    <div className="docs-content">
      <h1>ToastViewport</h1>
      <p className="docs-lead">
        The render target where toast notifications appear on screen.
      </p>

      <h2 id="basic-setup" className="docs-sh">
        Basic setup
      </h2>
      <Code lang="tsx">{`<ToastViewport position="bottom-right" />`}</Code>

      <h2 id="all-props" className="docs-sh">
        All props
      </h2>
      <Param
        name="position"
        type="ToastPosition"
        def="bottom-right"
        enums={[
          "top-left",
          "top-center",
          "top-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ]}
      >
        Screen position for the toast stack.
      </Param>
      <Param name="className" type="string">
        CSS class for the viewport container.
      </Param>
      <Param name="hotkey" type="string[]">
        Keyboard shortcuts to focus the toast viewport.
      </Param>
      <Param name="label" type="string" def="Notifications">
        ARIA label for screen readers.
      </Param>
    </div>
  );
}

function Positioning() {
  return (
    <div className="docs-content">
      <h1>Positioning</h1>
      <p className="docs-lead">
        Set the <code>position</code> prop on ToastViewport to control where
        notifications appear. Entrance animations adapt automatically.
      </p>

      <h2 id="available-positions" className="docs-sh">
        Available positions
      </h2>
      <div className="docs-penum" style={{ marginBottom: 24 }}>
        {[
          "top-left",
          "top-center",
          "top-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ].map((p) => (
          <code key={p}>{p}</code>
        ))}
      </div>

      <h2 id="example" className="docs-sh">
        Example
      </h2>
      <Code lang="tsx">{`// Fixed position
<ToastViewport position="top-center" />

// Dynamic position
const [pos, setPos] = useState("bottom-right");
<ToastViewport position={pos} />`}</Code>
    </div>
  );
}

function Theming() {
  return (
    <div className="docs-content">
      <h1>Theming</h1>
      <p className="docs-lead">
        Adapts to system preferences by default. Override with the{" "}
        <code>theme</code> prop or customize with CSS variables.
      </p>

      <h2 id="theme-prop" className="docs-sh">
        Theme prop
      </h2>
      <Code lang="tsx">{`// Follow system preference
<ToastProvider theme="system">

// Force a specific theme
<ToastProvider theme="dark">
<ToastProvider theme="light">`}</Code>

      <h2 id="css-variables" className="docs-sh">
        CSS variables
      </h2>
      <p className="docs-pd" style={{ marginBottom: 12 }}>
        Override these variables to customize the toast appearance globally.
      </p>
      <Code file="globals.css" lang="css">{`:root {
  --flux-toast-bg: #ffffff;
  --flux-toast-fg: #0f172a;
  --flux-toast-fg-secondary: #64748b;
  --flux-toast-border: #e2e8f0;
  --flux-toast-radius: 12px;
  --flux-toast-success: #10b981;
  --flux-toast-error: #ef4444;
  --flux-toast-warning: #f59e0b;
  --flux-toast-info: #6366f1;
}`}</Code>
    </div>
  );
}

function CustomJSX() {
  return (
    <div className="docs-content">
      <h1>Custom Content</h1>
      <p className="docs-lead">
        Pass React nodes directly with the <code>content</code> prop. Timer and
        interaction mechanics work consistently with custom content.
      </p>

      <h2 id="content-prop" className="docs-sh">
        Content prop
      </h2>
      <p className="docs-pd" style={{ marginBottom: 12 }}>
        When using <code>content</code>, the <code>title</code> and{" "}
        <code>description</code> props are ignored — you have full control over
        the toast body.
      </p>

      <h2 id="full-example" className="docs-sh">
        Full example
      </h2>
      <Code lang="tsx">{`toast({
  type: "info",
  duration: 10000,
  content: (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <img
        src="/avatar.png"
        width={36}
        height={36}
        style={{ borderRadius: 8 }}
      />
      <div>
        <strong>New message from Sarah</strong>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
          Hey, can you review the PR?
        </p>
      </div>
    </div>
  ),
});`}</Code>

      <Tip>
        <p>
          You can embed buttons, forms, images, and any interactive elements
          inside custom content. All native toast features (timer, swipe,
          dismiss) continue to work.
        </p>
      </Tip>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SECTION MAP + PAGE                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

const SECTIONS: Record<string, React.FC> = {
  introduction: () => <Introduction />,
  installation: () => <Installation />,
  "quick-start": () => <QuickStart />,
  "toast-api": () => <ToastAPI />,
  "promise-api": () => <PromiseAPI />,
  "update-api": () => <UpdateAPI />,
  "dismiss-api": () => <DismissAPI />,
  provider: () => <Provider />,
  viewport: () => <Viewport />,
  positioning: () => <Positioning />,
  theming: () => <Theming />,
  "custom-jsx": () => <CustomJSX />,
};

export default function DocsPage() {
  const [active, setActive] = useState("introduction");

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id && SECTIONS[id]) setActive(id);
    };
    window.addEventListener("docs-nav", handler);
    return () => window.removeEventListener("docs-nav", handler);
  }, []);

  const Render = SECTIONS[active];
  return Render ? <Render /> : <Introduction />;
}
