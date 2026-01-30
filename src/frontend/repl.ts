import * as path from "node:path";
import * as readline from "node:readline";
import { LuaCodeResourceView } from "../backend/importers/LuaCodeImporter";
import { preprocessLuaCode } from "../backend/luaPreprocessor";
import { Manifest } from "../backend/manifestTypes";
import { TicbuildProject } from "../backend/project";
import { TicbuildProjectCore } from "../backend/projectCore";
import * as cons from "../utils/console";
import { OptimizationRuleOptions } from "../utils/lua/lua_processor";
import { CoalesceBool } from "../utils/utils";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { printReplHelp } from "../utils/help";

function deepCloneManifest(manifest: Manifest): Manifest {
    return JSON.parse(JSON.stringify(manifest)) as Manifest;
}

function readLine(rl: readline.Interface, prompt: string): Promise<string | null> {
    return new Promise((resolve) => {
        const onLine = (input: string) => {
            cleanup();
            resolve(input);
        };
        const onClose = () => {
            cleanup();
            resolve(null);
        };
        const cleanup = () => {
            rl.removeListener("line", onLine);
            rl.removeListener("close", onClose);
        };

        rl.once("line", onLine);
        rl.once("close", onClose);
        rl.setPrompt(prompt);
        rl.prompt();
    });
}

type ReplCommandOptions = CommandLineOptions & {
    multiLine?: boolean;
};

type ReplState = {
    multiLine: boolean;
    minifyEnabled: boolean;
    ruleOverrides: Partial<OptimizationRuleOptions>;
};

type ParsedReplCommand = {
    name: string;
    args: string[];
};

const toggleableRuleKeys: Record<string, keyof OptimizationRuleOptions> = {
    stripcomments: "stripComments",
    renamelocalvariables: "renameLocalVariables",
    aliasrepeatedexpressions: "aliasRepeatedExpressions",
    aliasliterals: "aliasLiterals",
    simplifyexpressions: "simplifyExpressions",
    removeunusedlocals: "removeUnusedLocals",
    removeunusedfunctions: "removeUnusedFunctions",
    renametablefields: "renameTableFields",
    packlocaldeclarations: "packLocalDeclarations",
};

function getPrompt(state: ReplState, hasBuffer: boolean): string {
    if (!state.multiLine) {
        return "repl> ";
    }
    return hasBuffer ? "....> " : "repl> ";
}

function printReplBanner(core: TicbuildProjectCore, state: ReplState): void {
    cons.h1("ticbuild repl");
    cons.info(`Project: ${core.manifestPath}`);
    cons.info(`Build config: ${core.selectedBuildConfig || "(default)"}`);
    cons.info(`Mode: ${state.multiLine ? "multi-line" : "single-line"}`);
    cons.info("Type :help for commands. Use :quit to exit.\n");
}

function parseReplCommand(line: string): ParsedReplCommand | null {
    const trimmed = line.trim();
    if (!trimmed.startsWith(":")) {
        return null;
    }

    const content = trimmed.slice(1).trim();
    if (content.length === 0) {
        return { name: "end", args: [] };
    }

    const parts = content.split(/\s+/);
    const name = parts.shift() || "";
    return { name: name.toLowerCase(), args: parts };
}

async function handleReplCommand(
    command: ParsedReplCommand,
    state: ReplState,
    buffer: string[],
    flushBuffer: () => Promise<void>,
): Promise<"quit" | "handled" | false> {
    switch (command.name) {
        case "h":
        case "help":
            printReplHelp();
            return "handled";
        case "q":
        case "quit":
        case "exit":
            return "quit";
        case "end":
        case "eof":
            if (!state.multiLine) {
                cons.dim("Not in multi-line mode. Use --multi-line to enable it.");
                return "handled";
            }
            await flushBuffer();
            return "handled";
        case "minify":
        case "m":
            handleMinifyCommand(command.args, state);
            return "handled";
        default:
            cons.warning(`Unknown command: :${command.name}`);
            return "handled";
    }
}

function handleMinifyCommand(args: string[], state: ReplState): void {
    if (args.length === 0) {
        cons.info(`minify: ${state.minifyEnabled ? "on" : "off"}`);
        const overrides = Object.entries(state.ruleOverrides);
        if (overrides.length > 0) {
            cons.info(
                `rule overrides: ${overrides.map(([key, value]) => `${key}=${String(value)}`).join(", ")}`,
            );
        }
        return;
    }

    if (args.length === 1) {
        const value = parseOnOff(args[0]);
        if (value === null) {
            cons.error("Usage: :minify on|off OR :minify <rule> on|off");
            return;
        }
        state.minifyEnabled = value;
        cons.info(`minify: ${state.minifyEnabled ? "on" : "off"}`);
        return;
    }

    if (args.length === 2) {
        const ruleKey = args[0].toLowerCase();
        const rule = toggleableRuleKeys[ruleKey];
        if (!rule) {
            cons.error(`Unknown or non-toggleable rule: ${args[0]}`);
            return;
        }
        const value = parseOnOff(args[1]);
        if (value === null) {
            cons.error("Usage: :minify <rule> on|off");
            return;
        }
        state.ruleOverrides[rule] = value as any;
        cons.info(`minify ${rule}: ${value ? "on" : "off"}`);
        return;
    }

    cons.error("Usage: :minify on|off OR :minify <rule> on|off");
}

function parseOnOff(value: string): boolean | null {
    if (value.toLowerCase() === "on") {
        return true;
    }
    if (value.toLowerCase() === "off") {
        return false;
    }
    return null;
}

async function processInput(
    source: string,
    baseCore: TicbuildProjectCore,
    state: ReplState,
    replFilePath: string,
): Promise<void> {
    try {
        const core = createReplCore(baseCore, state);
        const preprocessed = await preprocessLuaCode(core, source, replFilePath);
        const view = new LuaCodeResourceView(source, preprocessed.code);
        const artifacts = view.getArtifacts(core);
        process.stdout.write(artifacts.minifiedSource + "\n");
    } catch (error) {
        cons.error(error instanceof Error ? error.message : String(error));
    }
}

function createReplCore(baseCore: TicbuildProjectCore, state: ReplState): TicbuildProjectCore {
    const manifest = deepCloneManifest(baseCore.manifest);
    if (!manifest.assembly.lua) {
        manifest.assembly.lua = {};
    }

    manifest.assembly.lua.minify = state.minifyEnabled;
    if (Object.keys(state.ruleOverrides).length > 0) {
        manifest.assembly.lua.minification = {
            ...(manifest.assembly.lua.minification || {}),
            ...state.ruleOverrides,
        };
    }

    return new TicbuildProjectCore({
        manifest,
        manifestPath: baseCore.manifestPath,
        projectDir: baseCore.projectDir,
        buildConfigName: baseCore.selectedBuildConfig,
        overrideVariables: baseCore.overrideVariables,
    });
}


export async function replCommand(manifestPath?: string, options?: ReplCommandOptions): Promise<void> {
    cons.info("ticbuild: repl command");

    const projectLoadOptions = parseBuildOptions(manifestPath, options);
    const project = TicbuildProject.loadFromManifest(projectLoadOptions);
    const baseCore = project.resolvedCore;

    const replState: ReplState = {
        multiLine: !!options?.multiLine,
        minifyEnabled: CoalesceBool(baseCore.manifest.assembly.lua?.minify, false),
        ruleOverrides: {},
    };

    const replFilePath = path.join(baseCore.projectDir, "__repl__.lua");

    printReplBanner(baseCore, replState);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    let isRunning = true;
    const buffer: string[] = [];

    rl.on("SIGINT", () => {
        cons.info("\nExiting REPL...");
        rl.close();
    });

    while (isRunning) {
        const prompt = getPrompt(replState, buffer.length > 0);
        const line = await readLine(rl, prompt);
        if (line === null) {
            break;
        }

        const trimmed = line.trim();
        if (trimmed.length === 0 && (!replState.multiLine || buffer.length === 0)) {
            continue;
        }

        const parsedCommand = parseReplCommand(line);
        if (parsedCommand) {
            const handled = await handleReplCommand(parsedCommand, replState, buffer, async () => {
                const source = buffer.join("\n");
                buffer.length = 0;
                if (source.trim().length === 0) {
                    return;
                }
                await processInput(source, baseCore, replState, replFilePath);
            });

            if (handled === "quit") {
                isRunning = false;
                break;
            }
            if (handled) {
                continue;
            }
        }

        if (replState.multiLine) {
            buffer.push(line);
            continue;
        }

        await processInput(line, baseCore, replState, replFilePath);
    }

    rl.close();
}
