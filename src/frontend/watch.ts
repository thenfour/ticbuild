import { ChildProcess } from "node:child_process";
import chokidar from "chokidar";
import { TicbuildProject } from "../backend/project";
import { resolveTic80Location } from "../backend/tic80Resolver";
import * as cons from "../utils/console";
import { launchProcessReturnImmediately } from "../utils/tic80/launch";
import { getWindowPosition, setWindowPosition, waitForWindow, WindowPlacement } from "../utils/windowPosition";
import { buildCore } from "./core";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { assert } from "../utils/errorHandling";

export async function watchCommand(manifestPath?: string, options?: CommandLineOptions): Promise<void> {
  cons.info("ticbuild: watch command");

  let tic80Process: ChildProcess | undefined;
  let isBuilding = false;
  let pendingRebuild = false;
  let watcher: chokidar.FSWatcher | undefined;
  let currentWatchPaths: string[] = [];
  let savedWindowPosition: WindowPlacement | null = null;

  // Function to kill existing TIC-80 process
  const killTic80 = async () => {
    if (tic80Process && !tic80Process.killed) {
      cons.dim(`  Killing existing TIC-80 process (PID ${tic80Process.pid})...`);
      assert(tic80Process.pid !== undefined);

      // Save window position before killing
      savedWindowPosition = await getWindowPosition(tic80Process.pid);
      if (savedWindowPosition) {
        cons.dim(
          `  Saved window position: (${savedWindowPosition.x}, ${savedWindowPosition.y}) ${savedWindowPosition.width}x${savedWindowPosition.height}`,
        );
      }

      tic80Process.kill();
      tic80Process = undefined;
    }
  };

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

      // Resolve TIC-80 location
      const tic80Location = resolveTic80Location(project.resolvedCore.projectDir);
      if (!tic80Location) {
        cons.error(
          "TIC-80 executable not found. Please install TIC-80 and ensure it is in your PATH, or set TIC80_LOCATION in .env/.env.local.",
        );
        process.exit(1);
      }

      // Kill existing TIC-80 process before launching new one
      await killTic80();

      // Launch TIC-80 with the built cartridge
      cons.h1("Launching TIC-80 with built cartridge...");
      cons.info(`  ${outputFilePath}`);
      tic80Process = await launchProcessReturnImmediately(tic80Location.path, [outputFilePath, "--skip"]);
      cons.success("TIC-80 launched successfully.");

      // Restore window position if we have one saved
      if (savedWindowPosition && tic80Process.pid) {
        cons.dim("  Waiting for window to appear...");
        const windowFound = await waitForWindow(tic80Process.pid, 3000);
        if (windowFound) {
          cons.dim("  Restoring window position...");
          const restored = await setWindowPosition(tic80Process.pid, savedWindowPosition);
          if (restored) {
            cons.dim("  Window position restored.");
          }
        }
      }

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
  const cleanup = async () => {
    cons.info("\nShutting down...");
    await killTic80();
    if (watcher) {
      watcher.close();
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGTERM", cleanup);

  // Keep the process alive
  await new Promise(() => {});
}
