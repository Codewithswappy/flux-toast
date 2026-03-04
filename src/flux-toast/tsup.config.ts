import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  minify: false,
  sourcemap: true,
  external: ["react", "react-dom", "motion", "zustand"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: async () => {
    // Copy CSS files
    const fs = await import("fs");
    const path = await import("path");

    const stylesDir = path.join("dist", "styles");
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    fs.copyFileSync(
      path.join("styles", "index.css"),
      path.join(stylesDir, "index.css")
    );
    fs.copyFileSync(
      path.join("styles", "themes.css"),
      path.join(stylesDir, "themes.css")
    );

    console.log("✅ CSS files copied to dist/styles/");
  },
});
