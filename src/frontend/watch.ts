import chokidar from "chokidar";
import { TicbuildProject } from "../backend/project";
import { createTic80Controller } from "../backend/tic80Resolver";
import * as cons from "../utils/console";
import { buildCore } from "./core";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { ITic80Controller } from "../backend/tic80Controller/tic80Controller";
import { mergeTic80Args } from "../utils/tic80/args";

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
  let currentWatchPaths: string[] = [];
  let isShuttingDown = false;

  // Function to update the watched file list
  const updateWatchList = async () => {
    const projectLoadOptions = parseBuildOptions(manifestPath, options);
    const project = TicbuildProject.loadFromManifest(projectLoadOptions);
    await project.loadImports();

    const dependencyList = project.resourceMgr!.getDependencyList();

    // turn that into a distinct list.
    const distinctPaths = Array.from(new Set(dependencyList.map((dep) => dep.path))).sort();

    const newWatchPaths = [
      project.resolvedCore.manifestPath, // Watch the manifest file itself
      ...distinctPaths, // Watch all dependencies
    ];

    // Check if watch list has changed
    const pathsChanged =
      newWatchPaths.length !== currentWatchPaths.length ||
      newWatchPaths.some((path, index) => path !== currentWatchPaths[index]);

    if (pathsChanged) {
      const addedPaths = newWatchPaths.filter((path) => !currentWatchPaths.includes(path));
      const removedPaths = currentWatchPaths.filter((path) => !newWatchPaths.includes(path));

      if (addedPaths.length > 0) {
        cons.info(`\nAdding ${addedPaths.length} new file(s) to watch list:`);
        for (const path of addedPaths) {
          cons.dim(`  + ${path}`);
        }
        if (watcher) {
          watcher.add(addedPaths);
        }
      }

      if (removedPaths.length > 0) {
        cons.info(`\nRemoving ${removedPaths.length} file(s) from watch list:`);
        for (const path of removedPaths) {
          cons.dim(`  - ${path}`);
        }
        if (watcher) {
          watcher.unwatch(removedPaths);
        }
      }

      currentWatchPaths = newWatchPaths;
    }
  };

  // Function to perform build and launch
  const buildAndLaunch = async (changedPath?: string) => {
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

      // If the manifest changed, update the watch list
      if (changedPath === project.resolvedCore.manifestPath) {
        await updateWatchList();
      }

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

  cons.info(`\nWatching ${currentWatchPaths.length} file(s) for changes...`);
  for (const path of currentWatchPaths) {
    cons.dim(`  ${path}`);
  }

  // Set up file watcher with debouncing
  watcher = chokidar.watch(currentWatchPaths, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  watcher.on("change", (path: string) => {
    cons.info(`\nFile changed: ${path}`);
    buildAndLaunch(path);
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
