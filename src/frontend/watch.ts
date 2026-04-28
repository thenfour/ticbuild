import chokidar from "chokidar";
import * as path from "node:path";
import { TicbuildProject } from "../backend/project";
import { createTic80Controller } from "../backend/tic80Resolver";
import * as cons from "../utils/console";
import { buildCore } from "./core";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { ITic80Controller } from "../backend/tic80Controller/tic80Controller";
import { mergeTic80Args } from "../utils/tic80/args";

export function resolveAdditionalWatchGlob(projectDir: string, glob: string): string {
  const trimmed = glob.trim();
  if (trimmed.length === 0) {
    return "";
  }

  // make the glob absolute relative to the project dir. requires a bit of parsing in case of
  // negated globs ("!./src/generated/**/*.lua") => ("!projectDir/src/generated/**/*.lua")
  const isNegated = trimmed.startsWith("!");
  const rawPattern = isNegated ? trimmed.slice(1) : trimmed;
  const resolvedPattern = path.isAbsolute(rawPattern) ? rawPattern : path.join(projectDir, rawPattern);
  const normalizedPattern = resolvedPattern.replace(/\\/g, "/");
  return isNegated ? `!${normalizedPattern}` : normalizedPattern;
}

export function buildWatchTargets(
  manifestPath: string,
  dependencyPaths: string[],
  projectDir: string,
  additionalWatchGlobs: string[] = [],
): string[] {
  const resolvedAdditionalWatchGlobs = additionalWatchGlobs
    .map((glob) => resolveAdditionalWatchGlob(projectDir, glob))
    .filter((glob) => glob.length > 0);

  return Array.from(new Set([manifestPath, ...dependencyPaths, ...resolvedAdditionalWatchGlobs])).sort();
}

export async function watchCommand(
  manifestPath?: string,
  options?: CommandLineOptions,
  tic80Args: string[] = [],
): Promise<void> {
  cons.info("ticbuild: watch command");

  // needs to be mutable because it depends on env for tic80 location, which relies on project dir, which can change.
  let tic80Controller: ITic80Controller | undefined = undefined;
  let tic80ControllerInitialized = false;
  let isBuilding = false;
  let pendingRebuild = false;
  let watcher: chokidar.FSWatcher | undefined;
  let currentWatchTargets: string[] = [];
  let isShuttingDown = false;

  // Function to update the watched file list
  const updateWatchList = async () => {
    const projectLoadOptions = parseBuildOptions(manifestPath, options);
    const project = TicbuildProject.loadFromManifest(projectLoadOptions);
    await project.loadImports();

    const dependencyList = project.resourceMgr!.getDependencyList();

    // turn that into a distinct list.
    const distinctPaths = Array.from(new Set(dependencyList.map((dep) => dep.path))).sort();
    const additionalWatchGlobs = project.resolvedCore.manifest.project.additionalWatchGlobs || [];

    const newWatchTargets = buildWatchTargets(
      project.resolvedCore.manifestPath,
      distinctPaths,
      project.resolvedCore.projectDir,
      additionalWatchGlobs,
    );

    // Check if watch list has changed
    const targetsChanged =
      newWatchTargets.length !== currentWatchTargets.length ||
      newWatchTargets.some((target, index) => target !== currentWatchTargets[index]);

    if (targetsChanged) {
      const addedTargets = newWatchTargets.filter((target) => !currentWatchTargets.includes(target));
      const removedTargets = currentWatchTargets.filter((target) => !newWatchTargets.includes(target));

      if (addedTargets.length > 0) {
        cons.info(`\nAdding ${addedTargets.length} new watch target(s):`);
        for (const target of addedTargets) {
          cons.dim(`  + ${target}`);
        }
        if (watcher) {
          watcher.add(addedTargets);
        }
      }

      if (removedTargets.length > 0) {
        cons.info(`\nRemoving ${removedTargets.length} watch target(s):`);
        for (const target of removedTargets) {
          cons.dim(`  - ${target}`);
        }
        if (watcher) {
          watcher.unwatch(removedTargets);
        }
      }

      currentWatchTargets = newWatchTargets;
    }
  };

  // Function to perform build and launch
  const buildAndLaunch = async () => {
    if (isBuilding) {
      pendingRebuild = true;
      return;
    }

    isBuilding = true;
    pendingRebuild = false;

    try {
      // Build the project
      cons.info("\n" + "=".repeat(60));
      await buildCore(manifestPath, options);

      // Get the output file path
      const projectLoadOptions = parseBuildOptions(manifestPath, options);
      const project = TicbuildProject.loadFromManifest(projectLoadOptions);
      const outputFilePath = project.resolvedCore.getOutputFilePath();
      const manifestArgs = (project.resolvedCore.manifest.project.launchArgs || []).map((arg) =>
        project.resolvedCore.substituteVariables(arg),
      );
      const mergedArgs = mergeTic80Args(manifestArgs, tic80Args);

      // Resolve TIC-80 controller
      if (!tic80Controller) {
        tic80Controller = createTic80Controller(project.resolvedCore.projectDir, {
          remotingVerbose: !!options?.remotingVerbose,
        });
      }
      if (!tic80Controller) {
        cons.error("Failed to resolve TIC-80 controller");
        process.exit(1);
      }
      if (!tic80ControllerInitialized) {
        tic80ControllerInitialized = true;
        tic80Controller.onExit(() => {
          cleanup("TIC-80 process closed");
        });
      }

      // Launch/reload TIC-80 with the built cartridge
      cons.h1("Launching TIC-80 with built cartridge...");
      cons.info(`  ${outputFilePath}`);

      await tic80Controller.launchAndControlCart(outputFilePath, mergedArgs);
      //cons.success("TIC-80 launched successfully.");

      // Recompute dependencies after every successful build so newly discovered
      // includes/import dependencies are added to the watch list.
      await updateWatchList();

      cons.info("\nWatching for changes... (press Ctrl+C to stop)");
    } catch (error) {
      cons.error("Build failed:");
      cons.error(error instanceof Error ? error.message : String(error));
    } finally {
      isBuilding = false;

      // If a rebuild was requested while we were building, start it now
      if (pendingRebuild) {
        cons.dim("  Starting queued rebuild...");
        setTimeout(() => buildAndLaunch(), 100);
      }
    }
  };

  // Perform initial build
  await buildAndLaunch();

  // Get all dependencies to watch
  await updateWatchList();

  cons.info(`\nWatching ${currentWatchTargets.length} target(s) for changes...`);
  for (const target of currentWatchTargets) {
    cons.dim(`  ${target}`);
  }

  // Set up file watcher with debouncing
  watcher = chokidar.watch(currentWatchTargets, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  const onWatchEvent = (event: string, watchTarget: string) => {
    cons.info(`\nWatch target ${event}: ${watchTarget}`);
    buildAndLaunch();
  };

  watcher.on("change", (watchTarget: string) => {
    onWatchEvent("changed", watchTarget);
  });

  watcher.on("add", (watchTarget: string) => {
    onWatchEvent("added", watchTarget);
  });

  watcher.on("unlink", (watchTarget: string) => {
    onWatchEvent("removed", watchTarget);
  });

  watcher.on("error", (error: Error) => {
    cons.error(`Watcher error: ${error}`);
  });

  // Handle process exit to clean up
  const cleanup = async (reason?: string) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    cons.info("\nShutting down...");
    if (reason) {
      cons.info(`  ${reason}`);
    }
    if (tic80Controller) {
      await tic80Controller.stop();
    }
    if (watcher) {
      watcher.close();
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGQUIT", cleanup);

  // Keep the process alive
  await new Promise(() => { });
}
