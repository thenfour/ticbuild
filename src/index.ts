#!/usr/bin/env node

import { Command } from "commander";
import { resolveTic80Location } from "./backend/tic80Resolver";
import { buildInfo } from "./buildInfo";
import { buildCommand } from "./frontend/build";
import { initCommand, InitOptions } from "./frontend/init";
import { CommandLineOptions } from "./frontend/parseOptions";
import { runCommand } from "./frontend/run";
import { watchCommand } from "./frontend/watch";
import * as console from "./utils/console";
import {
  printBuildHelp,
  printInitHelp,
  printMainHelp,
  printRunHelp,
  printTic80Help,
  printWatchHelp,
} from "./utils/help";
import { launchProcessReturnImmediately } from "./utils/tic80/launch";
import { getBuildVersionTag } from "./utils/versionString";

async function launchTic80(): Promise<void> {
  const tic80Location = resolveTic80Location(process.cwd());
  if (!tic80Location) {
    console.error(
      "TIC-80 executable not found. Please install TIC-80 and ensure it is in your PATH, or set TIC80_LOCATION in .env/.env.local.",
    );
    process.exit(1);
  }
  await launchProcessReturnImmediately(tic80Location.path, ["--skip"]);
}

async function main(): Promise<void> {
  // Intercept help flags early before Commander processes them
  const args = process.argv.slice(2);

  // Handle global help
  if (args.length === 0 || (args.length === 1 && (args[0] === "-h" || args[0] === "--help"))) {
    printMainHelp();
    return;
  }

  // Handle command-specific help
  if (args.length >= 2 && (args.includes("-h") || args.includes("--help"))) {
    const command = args[0];
    switch (command) {
      case "build":
      case "b":
        printBuildHelp();
        return;
      case "run":
      case "r":
        printRunHelp();
        return;
      case "watch":
      case "w":
        printWatchHelp();
        return;
      case "init":
        printInitHelp();
        return;
      case "tic80":
      case "t":
        printTic80Help();
        return;
      case "help":
        // Let help command handle it naturally
        break;
    }
  }

  const program = new Command();

  // Disable default help
  program.helpOption(false);
  program.addHelpCommand(false);

  program
    .name("ticbuild")
    .description("A build & watch system for TIC-80")
    .version(getBuildVersionTag(buildInfo), "-v, --version", "Output version information");

  // Custom help handling for --help flag
  program.option("-h, --help", "Display help information");

  program
    .command("build [manifest]")
    .alias("b")
    .description("Build the cart based on the input manifest")
    .option("-m, --mode <name>", "Build configuration name")
    .option(
      "-v, --var <key=value>",
      "Override manifest variable",
      (value, previous: string[] = []) => {
        return [...previous, value];
      },
      [],
    )
    .action(async (manifest?: string, options?: CommandLineOptions) => {
      await buildCommand(manifest, options);
    });

  program
    .command("run [manifest]")
    .alias("r")
    .description("Build the cart and launch TIC-80")
    .option("-m, --mode <name>", "Build configuration name")
    .option(
      "-v, --var <key=value>",
      "Override manifest variable",
      (value, previous: string[] = []) => {
        return [...previous, value];
      },
      [],
    )
    .action(async (manifest?: string, options?: CommandLineOptions) => {
      await runCommand(manifest, options);
    });

  program
    .command("watch [manifest]")
    .alias("w")
    .description("Build, launch TIC-80, and watch for changes")
    .option("-m, --mode <name>", "Build configuration name")
    .option(
      "-v, --var <key=value>",
      "Override manifest variable",
      (value, previous: string[] = []) => {
        return [...previous, value];
      },
      [],
    )
    .action(async (manifest?: string, options?: CommandLineOptions) => {
      await watchCommand(manifest, options);
    });

  program
    .command("init [dir]")
    .description("Initialize a new ticbuild project")
    .option("-n, --name <name>", "Project name")
    .option("-t, --template <name>", "Template name (subdir in templates)")
    .option("-f, --force", "Overwrite existing files")
    .action(async (dir?: string, options?: InitOptions) => {
      await initCommand(dir, options);
    });

  program
    .command("tic80")
    .alias("t")
    .description("Launch TIC-80 directly")
    .action(async () => {
      await launchTic80();
    });

  program
    .command("help [command]")
    .description("Show help information")
    .action((command?: string) => {
      if (command) {
        switch (command) {
          case "build":
          case "b":
            printBuildHelp();
            break;
          case "run":
          case "r":
            printRunHelp();
            break;
          case "watch":
          case "w":
            printWatchHelp();
            break;
          case "init":
            printInitHelp();
            break;
          case "tic80":
          case "t":
            printTic80Help();
            break;
          default:
            console.error(`Unknown command: ${command}`);
            process.stdout.write("\n");
            printMainHelp();
            process.exit(1);
        }
      } else {
        printMainHelp();
      }
    });

  // Parse arguments
  await program.parseAsync(process.argv);
}

main();
