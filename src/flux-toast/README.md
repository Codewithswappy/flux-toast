<p align="center">
  <h1 align="center">flux-toast</h1>
  <p align="center">
    Beautiful, accessible, and performant toast notifications for React.<br/>
    TypeScript-first · SSR-safe · Motion-powered
  </p>
</p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#api-reference">API</a> ·
  <a href="#theming">Theming</a> ·
  <a href="#accessibility">Accessibility</a>
</p>

---

## Features

- 🎯 **Dead simple API** — `toast("Done!")` and you're set
- 🎨 **Beautiful defaults** — Looks great out of the box with light/dark themes
- ♿ **Accessible** — ARIA compliant, keyboard navigable, screen reader friendly
- 🚀 **Performant** — Zero unnecessary re-renders, proper memoization
- 📦 **Tiny** — Tree-shakeable, minimal dependencies
- 🔄 **Promise API** — Automatic loading → success/error transitions
- 📱 **Swipe to dismiss** — Mobile-first gesture support
- 🔢 **Duplicate grouping** — Shows counter badge instead of stacking duplicates
- 🎯 **Queue system** — Max visible limit with smooth promotion
- 🧩 **Headless mode** — Bring your own styles
- ⚡ **SSR Safe** — Works with Next.js App Router
- 🔒 **StrictMode compatible** — No double-fire issues

## Installation

```bash
npm install @flux-ui/toast motion zustand
```

```bash
yarn add @flux-ui/toast motion zustand
```

```bash
pnpm add @flux-ui/toast motion zustand
```

## Quick Start

### 1. Add the Provider

```tsx
// app/layout.tsx (Next.js App Router)
import { ToastProvider, ToastViewport } from "@flux-ui/toast";
import "@flux-ui/toast/styles";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
          <ToastViewport position="bottom-right" />
        </ToastProvider>
      </body>
    </html>
  );
}
```

### 2. Show Toasts Anywhere

```tsx
import { toast } from "@flux-ui/toast";

function SaveButton() {
  return <button onClick={() => toast.success("Profile saved!")}>Save</button>;
}
```

## API Reference

### `toast(message)`

Create a toast with a string or configuration object.

```ts
// Simple
toast("Hello, world!");

// With options
toast({
  title: "File uploaded",
  description: "report.pdf was saved",
  type: "success",
  duration: 5000,
});
```

### `toast.success(message)`

```ts
toast.success("Profile updated");
toast.success({
  title: "Saved",
  description: "All changes have been saved",
});
```

### `toast.error(message)`

```ts
toast.error("Something went wrong");
toast.error({
  title: "Upload failed",
  description: "The file exceeds 10MB limit",
});
```

### `toast.warning(message)`

```ts
toast.warning("Your session expires in 5 minutes");
```

### `toast.info(message)`

```ts
toast.info("A new update is available");
```

### `toast.loading(message)`

Creates a persistent loading toast (doesn't auto-dismiss).

```ts
const id = toast.loading("Uploading...");

// Later, update or dismiss it
toast.update(id, {
  type: "success",
  title: "Upload complete!",
});
```

### `toast.promise(promise, messages)`

Automatically transitions through loading → success/error states.

```ts
toast.promise(fetchData(), {
  loading: "Fetching data...",
  success: (data) => `Loaded ${data.length} items`,
  error: (err) => `Error: ${err.message}`,
});
```

### `toast.dismiss(id?)`

Dismiss a specific toast or all toasts.

```ts
toast.dismiss("toast-id"); // specific
toast.dismiss(); // all
```

### `toast.update(id, data)`

Update an existing toast.

```ts
toast.update(id, {
  type: "success",
  title: "Done!",
  description: "Everything is ready",
});
```

### `toast.clear()`

Remove all toasts immediately.

```ts
toast.clear();
```

### Toast Options

| Option         | Type                                                       | Default  | Description                               |
| -------------- | ---------------------------------------------------------- | -------- | ----------------------------------------- |
| `id`           | `string`                                                   | auto     | Custom toast ID                           |
| `type`         | `"success" \| "error" \| "warning" \| "info" \| "loading"` | `"info"` | Toast type                                |
| `title`        | `string`                                                   | —        | Toast title                               |
| `description`  | `string`                                                   | —        | Toast description                         |
| `duration`     | `number`                                                   | `4000`   | Auto-dismiss in ms. `Infinity` to persist |
| `dismissible`  | `boolean`                                                  | `true`   | Show close button                         |
| `icon`         | `ReactNode`                                                | auto     | Custom icon                               |
| `action`       | `{ label, onClick }`                                       | —        | Action button                             |
| `content`      | `ReactNode`                                                | —        | Custom JSX content                        |
| `className`    | `string`                                                   | —        | Additional CSS class                      |
| `pauseOnHover` | `boolean`                                                  | `true`   | Pause timer on hover                      |
| `onDismiss`    | `(toast) => void`                                          | —        | Callback on dismiss                       |
| `onAutoClose`  | `(toast) => void`                                          | —        | Callback on auto-close                    |

## Components

### `<ToastProvider>`

Wraps your app to configure the toast system.

```tsx
<ToastProvider
  maxVisible={5} // Max visible toasts (default: 5)
  defaultDuration={4000} // Default duration in ms (default: 4000)
  position="bottom-right" // Default position
  theme="system" // "light" | "dark" | "system"
  groupDuplicates={true} // Group duplicate messages (default: true)
  gap={12} // Gap between toasts in px (default: 12)
  headless={false} // Disable default styles (default: false)
>
  {children}
</ToastProvider>
```

### `<ToastViewport>`

Renders the toast container. Place it inside the provider.

```tsx
<ToastViewport
  position="bottom-right" // Override provider position
  className="my-viewport" // Additional CSS class
  label="Notifications" // Screen reader label
/>
```

**Supported positions:**

- `top-left`
- `top-center`
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`

## Hooks

### `useToast()`

React hook to access toast state.

```tsx
const {
  toasts, // Visible toasts
  allToasts, // All toasts including hidden
  queue, // Queued toasts
  queueCount, // Number of queued toasts
  position, // Current position
  theme, // Current theme
  dismiss, // (id) => void
  pause, // (id) => void
  resume, // (id) => void
} = useToast();
```

## Theming

### CSS Variables

Override any CSS variable to customize the appearance:

```css
:root {
  --flux-toast-bg: #ffffff;
  --flux-toast-fg: #1a1a2e;
  --flux-toast-fg-secondary: #64748b;
  --flux-toast-border: rgba(0, 0, 0, 0.08);
  --flux-toast-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --flux-toast-radius: 14px;
  --flux-toast-font: "Inter", sans-serif;
  --flux-toast-font-size: 14px;
  --flux-toast-padding: 14px 16px;
  --flux-toast-z: 999999;

  /* Type colors */
  --flux-toast-success: #10b981;
  --flux-toast-error: #ef4444;
  --flux-toast-warning: #f59e0b;
  --flux-toast-info: #6366f1;
  --flux-toast-loading: #8b5cf6;
}
```

### Dark Mode

Dark mode is automatic via `prefers-color-scheme` when `theme="system"`.

Manual control:

```tsx
<ToastProvider theme="dark">
```

Or with `data-theme` attribute:

```html
<html data-theme="dark"></html>
```

### Theme Presets

Import the themes CSS and use `data-flux-theme`:

```tsx
import "@flux-ui/toast/themes";

// Then on any parent element:
<div data-flux-theme="minimal">  {/* Clean, subtle */}
<div data-flux-theme="vibrant">  {/* Colorful gradients */}
<div data-flux-theme="glass">    {/* Glassmorphism */}
```

### Headless Mode

Strip all default styles and bring your own:

```tsx
<ToastProvider headless>
```

## Accessibility

flux-toast is built with accessibility as a first-class concern:

- **ARIA roles**: `role="status"` for info/success, `role="alert"` for errors/warnings
- **Live regions**: `aria-live="polite"` / `aria-live="assertive"` based on type
- **Keyboard navigation**: Tab through toasts, Escape to dismiss, Alt+T to focus
- **Screen reader announcements**: Dynamic live region updates
- **Focus management**: Action buttons are properly focusable
- **Reduced motion**: Respects `prefers-reduced-motion` for all animations

## Advanced Usage

### Action Buttons

```tsx
toast({
  title: "File deleted",
  description: "report.pdf was removed",
  action: {
    label: "Undo",
    onClick: () => {
      toast.success("File restored!");
    },
  },
});
```

### Custom JSX Content

```tsx
toast({
  type: "info",
  content: (
    <div style={{ display: "flex", gap: 12 }}>
      <img src="/avatar.png" width={40} height={40} />
      <div>
        <strong>John Doe</strong>
        <p>Sent you a message</p>
      </div>
    </div>
  ),
});
```

### Update Toast by ID

```tsx
const id = toast.loading("Processing...");

// Later:
toast.update(id, {
  type: "success",
  title: "Complete!",
  duration: 3000,
});
```

### Custom Duration

```tsx
toast.info({ title: "Quick!", duration: 1500 });
toast.info({ title: "Stay forever", duration: Infinity });
```

### Dismiss Callbacks

```tsx
toast({
  title: "Important",
  onDismiss: (t) => console.log("Dismissed:", t.id),
  onAutoClose: (t) => console.log("Auto-closed:", t.id),
});
```

## Next.js (App Router)

```tsx
// app/layout.tsx
import { ToastProvider, ToastViewport } from "@flux-ui/toast";
import "@flux-ui/toast/styles";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider theme="system" position="bottom-right">
          {children}
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
"use client";
import { toast } from "@flux-ui/toast";

export default function Page() {
  return <button onClick={() => toast.success("It works!")}>Show Toast</button>;
}
```

## Performance Philosophy

- **Zero unnecessary re-renders**: Only components that depend on changed state re-render
- **Vanilla Zustand store**: Imperative API (`toast()`) works without React context
- **`useSyncExternalStore`**: Concurrent mode safe subscriptions
- **`memo`**: ToastItem is memoized to prevent sibling re-renders
- **Timer cleanup**: All timers are properly cleared on unmount
- **StrictMode safe**: No stale closures, no double-fire issues
- **Tree-shakeable**: Only import what you use

## License

MIT © [flux-ui](https://github.com/flux-ui)
