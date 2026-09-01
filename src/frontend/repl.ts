import * as path from "node:path";
import * as readline from "node:readline";
import { processLuaSnippet } from "../backend/codeSnippetProcessor";
import { TicbuildProject } from "../backend/project";
import { TicbuildProjectCore } from "../backend/projectCore";
import * as cons from "../utils/console";
import { printReplHelp } from "../utils/help";
import { OptimizationRuleOptions } from "../utils/lua/lua_processor";
import { luaOptimizationRules } from "../utils/lua/lua_optimizer_rules";
import { CoalesceBool } from "../utils/utils";
import { getErrorMessage } from "../utils/errorHandling";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";

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
    minificationOverrides: Partial<OptimizationRuleOptions>;
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
    canonicalizesyntax: "canonicalizeSyntax",
    simplifycontrolflow: "simplifyControlFlow",
};

const optimizationRuleIds = new Map(
    luaOptimizationRules.map((rule) => [rule.id.toLowerCase(), rule.id]),
);

function getPrompt(state: ReplState, hasBuffer: boolean): string {
    if (!state.multiLine) {
        return "repl> ";
    }
    return hasBuffer ? "....> " : "repl> ";
}

function printReplBanner(core: TicbuildProjectCore, state: ReplState): void {
    cons.h1("ticbuild repl");
    cons.info(`Project: ${core.manifestPath}`);
    cons.info(`Build config: ${core.selectedBuildConfig}`);
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
        const overrides = Object.entries(state.minificationOverrides)
            .filter(([key]) => key !== "ruleOverrides");
        if (overrides.length > 0) {
            cons.info(
                `option overrides: ${overrides.map(([key, value]) => `${key}=${String(value)}`).join(", ")}`,
            );
        }
        const ruleOverrides = Object.entries(state.minificationOverrides.ruleOverrides ?? {});
        if (ruleOverrides.length > 0) {
            cons.info(
                `rule overrides: ${ruleOverrides.map(([key, value]) => `${key}=${String(value)}`).join(", ")}`,
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
        const option = toggleableRuleKeys[ruleKey];
        const ruleId = optimizationRuleIds.get(ruleKey);
        if (!option && !ruleId) {
            cons.error(`Unknown or non-toggleable rule: ${args[0]}`);
            return;
        }
        const value = parseOnOff(args[1]);
        if (value === null) {
            cons.error("Usage: :minify <rule> on|off");
            return;
        }
        if (option) {
            state.minificationOverrides[option] = value as never;
            cons.info(`minify ${option}: ${value ? "on" : "off"}`);
        } else if (ruleId) {
            state.minificationOverrides.ruleOverrides = {
                ...state.minificationOverrides.ruleOverrides,
                [ruleId]: value,
            };
            cons.info(`minify ${ruleId}: ${value ? "on" : "off"}`);
        }
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
        const result = await processLuaSnippet(
            source,
            baseCore,
            {
                minifyEnabled: state.minifyEnabled,
                minificationOverrides: state.minificationOverrides,
            },
            replFilePath,
            { parseFailure: "return-original" },
        );
        process.stdout.write(result.minifiedSource + "\n");
    } catch (error) {
        cons.error(getErrorMessage(error));
    }
}

export async function replCommand(manifestPath?: string, options?: ReplCommandOptions): Promise<void> {
    cons.info("ticbuild: repl command");

    const projectLoadOptions = parseBuildOptions(manifestPath, options);
    const project = TicbuildProject.loadFromManifest(projectLoadOptions);
    const baseCore = project.resolvedCore;

    const replState: ReplState = {
        multiLine: !!options?.multiLine,
        minifyEnabled: CoalesceBool(baseCore.manifest.assembly.lua?.minify, false),
        minificationOverrides: {},
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
