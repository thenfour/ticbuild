import "./styles.css";
import type {
  LuaOptimizationRuleState,
  LuaSnippetProjectConfig,
  LuaSnippetResult,
  LuaSnippetSettings,
} from "../../../src/backend/luaSnippetProcessor";
import type { LuaMinificationConfig } from "../../../src/backend/manifestTypes";
import type {
  OptimizationRuleId,
  OptimizationRuleOptions,
} from "../../../src/utils/lua/lua_optimizer_types";

type ConfigResponse = { config: LuaSnippetProjectConfig };
type ProcessResponse = { result: LuaSnippetResult; elapsedMs: number };
type ApiErrorPayload = {
  name?: string;
  message: string;
  index?: number;
  line?: number;
  column?: number;
};

const SAMPLE_SOURCE = `-- Edit this source or paste a larger Lua sample.
local function distanceSquared(ax, ay, bx, by)
  local dx = bx - ax
  local dy = by - ay
  return dx * dx + dy * dy
end

local near = distanceSquared(2, 3, 8, 9) < 100
if near == true then
  trace("near")
else
  trace("far")
end
`;

const booleanOptions = [
  ["stripComments", "Strip comments"],
  ["renameLocalVariables", "Rename local variables"],
  ["aliasRepeatedExpressions", "Alias repeated expressions"],
  ["aliasLiterals", "Alias literals"],
  ["simplifyExpressions", "Simplify expressions"],
  ["removeUnusedLocals", "Remove unused locals"],
  ["removeUnusedFunctions", "Remove unused functions"],
  ["renameTableFields", "Rename table fields"],
  ["packLocalDeclarations", "Pack local declarations"],
  ["canonicalizeSyntax", "Canonicalize syntax"],
  ["simplifyControlFlow", "Simplify control flow"],
] as const;

const listOptions = [
  ["functionNamesToKeep", "Function names to keep"],
  ["tableEntryKeysToRename", "Table keys allowed to rename"],
  ["globalSymbolsToRename", "Globals allowed to rename"],
  ["globalSymbolsToKeep", "Globals to keep"],
] as const;

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

const sourceElement = requiredElement<HTMLTextAreaElement>("source");
const outputElement = requiredElement<HTMLTextAreaElement>("output");
const outputPanel = requiredElement<HTMLElement>("output-panel");
const outputView = requiredElement<HTMLSelectElement>("output-view");
const copyOutput = requiredElement<HTMLButtonElement>("copy-output");
const minifyEnabled = requiredElement<HTMLInputElement>("minify-enabled");
const booleanOptionsContainer = requiredElement<HTMLElement>("boolean-options");
const advancedOptionsContainer = requiredElement<HTMLElement>("advanced-options");
const ruleOptionsContainer = requiredElement<HTMLElement>("rule-options");
const statusElement = requiredElement<HTMLElement>("status");
const statsElement = requiredElement<HTMLElement>("stats");
const reportElement = requiredElement<HTMLElement>("report");
const inputBytesElement = requiredElement<HTMLElement>("input-bytes");
const projectNameElement = requiredElement<HTMLElement>("project-name");
const projectPathElement = requiredElement<HTMLElement>("project-path");

let projectConfig: LuaSnippetProjectConfig;
let settings: LuaSnippetSettings;
let lastResult: LuaSnippetResult | undefined;
let debounceHandle: number | undefined;
let activeRequest: AbortController | undefined;
let requestSequence = 0;
const ruleStatusElements = new Map<string, HTMLElement>();

function cloneOptions(options: OptimizationRuleOptions): LuaMinificationConfig {
  return structuredClone(options);
}

function setStatus(message: string, kind: "loading" | "ready" | "error"): void {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${new Intl.NumberFormat().format(bytes)} B (${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KiB)`;
}

function optionRecord(): Record<string, unknown> {
  return settings.minificationOverrides as unknown as Record<string, unknown>;
}

function setOption(key: string, value: unknown): void {
  settings = {
    ...settings,
    minificationOverrides: {
      ...settings.minificationOverrides,
      [key]: value,
    } as LuaMinificationConfig,
  };
  scheduleProcess();
}

function appendLabeledControl(labelText: string, control: HTMLElement, container: HTMLElement): void {
  const label = document.createElement("label");
  label.className = "setting-control";
  const text = document.createElement("span");
  text.textContent = labelText;
  label.append(text, control);
  container.append(label);
}

function renderBooleanOptions(): void {
  booleanOptionsContainer.replaceChildren();
  for (const [key, label] of booleanOptions) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = optionRecord()[key] === true;
    input.addEventListener("change", () => setOption(key, input.checked));
    const row = document.createElement("label");
    row.className = "toggle-row";
    const text = document.createElement("span");
    text.textContent = label;
    row.append(text, input);
    booleanOptionsContainer.append(row);
  }
}

function renderAdvancedOptions(): void {
  advancedOptionsContainer.replaceChildren();

  const lineBehavior = document.createElement("select");
  for (const value of ["pretty", "tight", "tight2", "single-line-blocks", "traceable"] as const) {
    lineBehavior.add(new Option(value, value));
  }
  lineBehavior.value = String(optionRecord().lineBehavior ?? "tight");
  lineBehavior.addEventListener("change", () => setOption("lineBehavior", lineBehavior.value));
  appendLabeledControl("Line behavior", lineBehavior, advancedOptionsContainer);

  const globalRenaming = document.createElement("select");
  for (const value of ["off", "opt-in", "opt-out"] as const) {
    globalRenaming.add(new Option(value, value));
  }
  globalRenaming.value = String(optionRecord().globalSymbolRenaming ?? "opt-in");
  globalRenaming.addEventListener("change", () => setOption("globalSymbolRenaming", globalRenaming.value));
  appendLabeledControl("Global renaming", globalRenaming, advancedOptionsContainer);

  for (const [key, label, minimum] of [
    ["maxIndentLevel", "Maximum indent", 0],
    ["maxLineLength", "Maximum line length", 20],
  ] as const) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(minimum);
    input.step = "1";
    input.value = String(optionRecord()[key] ?? 0);
    input.addEventListener("change", () => setOption(key, Number(input.value)));
    appendLabeledControl(label, input, advancedOptionsContainer);
  }

  for (const [key, label] of listOptions) {
    const input = document.createElement("input");
    input.type = "text";
    const value = optionRecord()[key];
    input.value = Array.isArray(value) ? value.join(", ") : "";
    input.placeholder = "comma-separated";
    input.addEventListener("change", () => {
      setOption(
        key,
        input.value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      );
    });
    appendLabeledControl(label, input, advancedOptionsContainer);
  }
}

function setRuleOverride(ruleId: string, value: string): void {
  const nextOverrides: Record<string, boolean> = {
    ...(settings.minificationOverrides.ruleOverrides ?? {}),
  };
  if (value === "inherit") {
    delete nextOverrides[ruleId];
  } else {
    nextOverrides[ruleId] = value === "on";
  }
  setOption("ruleOverrides", nextOverrides as Partial<Record<OptimizationRuleId, boolean>>);
}

function renderRuleOptions(ruleStates: LuaOptimizationRuleState[]): void {
  ruleOptionsContainer.replaceChildren();
  ruleStatusElements.clear();
  let currentFamily = "";
  for (const rule of ruleStates) {
    if (rule.family !== currentFamily) {
      currentFamily = rule.family;
      const family = document.createElement("div");
      family.className = "rule-family";
      family.textContent = currentFamily;
      ruleOptionsContainer.append(family);
    }

    const row = document.createElement("div");
    row.className = "rule-row";
    const summary = document.createElement("div");
    const title = document.createElement("div");
    title.className = "rule-title";
    title.textContent = rule.id;
    const description = document.createElement("div");
    description.className = "rule-description";
    description.textContent = rule.description;
    summary.append(title, description);

    const actions = document.createElement("div");
    actions.className = "rule-actions";
    const badge = document.createElement("span");
    badge.className = "rule-status";
    ruleStatusElements.set(rule.id, badge);
    const select = document.createElement("select");
    select.setAttribute("aria-label", `${rule.id} override`);
    select.add(new Option("inherit", "inherit"));
    select.add(new Option("on", "on"));
    select.add(new Option("off", "off"));
    const override = settings.minificationOverrides.ruleOverrides?.[rule.id as OptimizationRuleId];
    select.value = override === undefined ? "inherit" : override ? "on" : "off";
    select.addEventListener("change", () => setRuleOverride(rule.id, select.value));
    actions.append(badge, select);
    row.append(summary, actions);
    ruleOptionsContainer.append(row);
  }
  updateRuleStatuses(ruleStates);
}

function updateRuleStatuses(ruleStates: LuaOptimizationRuleState[]): void {
  for (const rule of ruleStates) {
    const badge = ruleStatusElements.get(rule.id);
    if (!badge) continue;
    badge.textContent = rule.enabled ? "on" : "off";
    badge.dataset.enabled = String(rule.enabled);
  }
}

function renderControls(ruleStates: LuaOptimizationRuleState[]): void {
  minifyEnabled.checked = settings.minifyEnabled;
  renderBooleanOptions();
  renderAdvancedOptions();
  renderRuleOptions(ruleStates);
}

function applyPreset(name: "project" | "release" | "max"): void {
  settings = {
    minifyEnabled: name === "project" ? projectConfig.settings.minifyEnabled : true,
    minificationOverrides: cloneOptions(projectConfig.presets[name]),
  };
  renderControls(projectConfig.ruleStates);
  scheduleProcess(0);
}

function updateOutput(): void {
  if (!lastResult) return;
  outputElement.value = outputView.value === "preprocessed"
    ? lastResult.preprocessedSource
    : lastResult.minifiedSource;
}

function appendStat(label: string, value: string, valueAsNorm01?: number): void {
  const item = document.createElement("div");
  // set a data attribute for CSS to style the value as a percentage bar if desired
  if (valueAsNorm01 !== undefined) {
    item.dataset.valueNorm01 = `${valueAsNorm01}`;
    item.classList.add("stat-with-bar");
    item.style.setProperty("--value-norm01", `${valueAsNorm01}`);
  }
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  item.append(labelElement, valueElement);
  statsElement.append(item);
}

function showResult(result: LuaSnippetResult, elapsedMs: number): void {
  lastResult = result;
  updateOutput();
  outputPanel.classList.remove("stale");
  inputBytesElement.textContent = formatBytes(result.sizes.inputBytes);
  statsElement.replaceChildren();
  appendStat("Input", formatBytes(result.sizes.inputBytes), result.sizes.inputBytes / result.sizes.inputBytes);
  appendStat("Preprocessed", formatBytes(result.sizes.preprocessedBytes), result.sizes.preprocessedBytes / result.sizes.inputBytes);
  appendStat("Minified", formatBytes(result.sizes.minifiedBytes), result.sizes.minifiedBytes / result.sizes.inputBytes);
  const saved = result.sizes.preprocessedBytes - result.sizes.minifiedBytes;
  const percent = result.sizes.preprocessedBytes === 0 ? 0 : (saved / result.sizes.preprocessedBytes) * 100;
  appendStat("Optimizer delta", `${saved >= 0 ? "−" : "+"}${formatBytes(Math.abs(saved))} (${percent.toFixed(1)}%)`);

  reportElement.replaceChildren();
  // if (result.minificationReport.constrainedFunctions.length === 0) {
  //   const quiet = document.createElement("div");
  //   quiet.className = "report-quiet";
  //   quiet.textContent = "No aliases were omitted by Lua's active-local limit.";
  //   reportElement.append(quiet);
  // } else {
  //   for (const fn of result.minificationReport.constrainedFunctions) {
  //     const item = document.createElement("div");
  //     item.className = "report-warning";
  //     const omitted = Object.values(fn.rules).reduce((sum, rule) => sum + rule.omitted, 0);
  //     item.textContent =
  //       `${fn.functionName}:${fn.sourceLine} — ${omitted} profitable aliases omitted; `
  //       + `${fn.peakActiveLocals}/${fn.localLimit} active locals.`;
  //     reportElement.append(item);
  //   }
  // }
  updateRuleStatuses(result.ruleStates);
  const dependencyLabel = `${result.dependencies.length} source file${result.dependencies.length === 1 ? "" : "s"}`;
  setStatus(`Ready · ${elapsedMs.toFixed(1)} ms · ${dependencyLabel}`, "ready");
}

function formatApiError(error: ApiErrorPayload): string {
  const location = error.line === undefined || /^\[\d+:\d+\]/.test(error.message)
    ? ""
    : ` at ${error.line}:${error.column ?? 0}`;
  return `${error.message}${location}`;
}

async function runProcess(): Promise<void> {
  const sequence = ++requestSequence;
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  setStatus("Optimizing…", "loading");

  try {
    const response = await fetch("/api/lua-optimizer/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: sourceElement.value, settings }),
      signal: controller.signal,
    });
    const body = await response.json() as ProcessResponse | { error: ApiErrorPayload };
    if (sequence !== requestSequence) return;
    if (!response.ok || "error" in body) {
      const error = "error" in body ? body.error : { message: `HTTP ${response.status}` };
      outputPanel.classList.add("stale");
      setStatus(`Invalid input — showing last valid output: ${formatApiError(error)}`, "error");
      return;
    }
    showResult(body.result, body.elapsedMs);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    if (sequence !== requestSequence) return;
    outputPanel.classList.add("stale");
    setStatus(error instanceof Error ? error.message : String(error), "error");
  }
}

function scheduleProcess(delay = 180): void {
  if (debounceHandle !== undefined) window.clearTimeout(debounceHandle);
  debounceHandle = window.setTimeout(() => void runProcess(), delay);
}

async function loadConfig(): Promise<void> {
  const response = await fetch("/api/lua-optimizer/config");
  const body = await response.json() as ConfigResponse | { error: ApiErrorPayload };
  if (!response.ok || "error" in body) {
    const error = "error" in body ? body.error : { message: `HTTP ${response.status}` };
    throw new Error(formatApiError(error));
  }

  projectConfig = body.config;
  settings = structuredClone(projectConfig.settings);
  projectNameElement.textContent = `${projectConfig.projectName} · ${projectConfig.buildConfig}`;
  projectPathElement.textContent = projectConfig.manifestPath;
  projectPathElement.title = projectConfig.manifestPath;
  renderControls(projectConfig.ruleStates);
  scheduleProcess(0);
}

sourceElement.value = localStorage.getItem("ticbuild.lua-optimizer.source") ?? SAMPLE_SOURCE;
inputBytesElement.textContent = formatBytes(new TextEncoder().encode(sourceElement.value).length);
sourceElement.addEventListener("input", () => {
  localStorage.setItem("ticbuild.lua-optimizer.source", sourceElement.value);
  inputBytesElement.textContent = formatBytes(new TextEncoder().encode(sourceElement.value).length);
  scheduleProcess();
});
outputView.addEventListener("change", updateOutput);
minifyEnabled.addEventListener("change", () => {
  settings = { ...settings, minifyEnabled: minifyEnabled.checked };
  scheduleProcess(0);
});
copyOutput.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(outputElement.value);
    copyOutput.textContent = "Copied";
    window.setTimeout(() => { copyOutput.textContent = "Copy"; }, 900);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), "error");
  }
});
document.querySelectorAll<HTMLButtonElement>("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset as "project" | "release" | "max"));
});

void loadConfig().catch((error) => {
  setStatus(error instanceof Error ? error.message : String(error), "error");
});
