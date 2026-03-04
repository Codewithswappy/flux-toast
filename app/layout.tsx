import type { Metadata } from "next";
import "./globals.css";
import "flux-toast/styles";
import "flux-toast/themes";

export const metadata: Metadata = {
  title: "Flux Toast — Premium Toast Notifications for React",
  description:
    "A production-ready, accessible, performant toast notification library for React and Next.js. TypeScript-first, SSR-safe, and beautifully animated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
