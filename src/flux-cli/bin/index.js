#!/usr/bin/env node

import { Command } from "commander";
import prompts from "prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { execSync } from "child_process";
import path from "path";

const program = new Command();

program
  .name("flux")
  .description("CLI to initialize flux-toast in your project")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize flux-toast in your project")
  .action(async () => {
    console.log(chalk.bold.blue("\n✨ Initializing Flux Toast...\n"));

    // Check project type
    const pkgPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath)) {
      console.error(chalk.red("❌ Error: Could not find package.json in current directory."));
      console.log(chalk.yellow("Please run this command from the root of your project."));
      process.exit(1);
    }

    // Install dependencies
    console.log(chalk.cyan("📦 Installing dependencies (flux-toast, motion, zustand)..."));
    try {
      // Use the appropriate package manager
      const installCommand = fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))
        ? "pnpm add flux-toast motion zustand"
        : fs.existsSync(path.join(process.cwd(), "yarn.lock"))
        ? "yarn add flux-toast motion zustand"
        : "npm install flux-toast motion zustand";
        
      execSync(installCommand, { stdio: "inherit" });
      console.log(chalk.green("\n✅ Dependencies installed successfully!"));
    } catch (e) {
      console.error(chalk.red("❌ Error installing dependencies."));
      process.exit(1);
    }

    const response = await prompts([
      {
        type: "confirm",
        name: "setupLayout",
        message: "Would you like to automatically configure ToastProvider in your app/layout.tsx? (Experimental)",
        initial: true,
      }
    ]);

    if (response.setupLayout) {
      const layoutPath = path.join(process.cwd(), "app", "layout.tsx");
      if (fs.existsSync(layoutPath)) {
        let content = fs.readFileSync(layoutPath, "utf-8");
        
        // Add imports
        if (!content.includes("flux-toast")) {
          const importLines = 'import { ToastProvider, ToastViewport } from "flux-toast";\nimport "flux-toast/styles";\n';
          content = importLines + content;
          
          // Wrap with ToastProvider (naive regex approach)
          if (content.includes("<body>") && content.includes("</body>")) {
             content = content.replace("<body>", "<body>\n        <ToastProvider>");
             content = content.replace("</body>", "          <ToastViewport />\n        </ToastProvider>\n      </body>");
             fs.writeFileSync(layoutPath, content);
             console.log(chalk.green("✅ Configuration added to app/layout.tsx!"));
          } else {
             console.log(chalk.yellow("⚠️ Could not find <body> tags to wrap with ToastProvider. Please add it manually."));
          }
        }
      } else {
        console.log(chalk.yellow("⚠️ Could not find app/layout.tsx. Skipping automatic configuration."));
      }
    }

    console.log(chalk.bold.green("\n🎉 Setup complete! You're ready to use Flux Toast."));
    console.log(`\nUsage:\n  ${chalk.cyan('import { toast } from "flux-toast";')}\n  ${chalk.cyan('toast("Hello Flux!");')}\n`);
  });

program.parse();
