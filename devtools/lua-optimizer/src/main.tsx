import { Fragment, useEffect, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import type {
  CodeSnippetLanguage,
  CodeSnippetProjectConfig,
  CodeSnippetResult,
  CodeSnippetSettings,
  CodeSnippetStage,
  LuaOptimizationRuleState,
  TypeScriptSnippetProfile,
} from "../../../src/backend/codeSnippetProcessor";
import type { LuaMinificationConfig } from "../../../src/backend/manifestTypes";
import type {
  OptimizationRuleId,
  OptimizationRuleOptions,
} from "../../../src/utils/lua/lua_optimizer_types";

type ConfigResponse = { config: CodeSnippetProjectConfig };
type ProcessResponse = { result: CodeSnippetResult; elapsedMs: number };
type ApiErrorPayload = {
  name?: string;
  message: string;
  stage?: CodeSnippetStage;
  index?: number;
  line?: number;
  column?: number;
};
type OutputView = "generated" | "preprocessed" | "minified";
type PresetName = "project" | "release" | "max";
type RequestState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; elapsedMs: number }
  | { kind: "error"; error: ApiErrorPayload };

type AppState = {
  language: CodeSnippetLanguage;
  sources: Record<CodeSnippetLanguage, string>;
  typeScriptProfileId: string;
  settings: CodeSnippetSettings | null;
  outputView: OutputView;
  result?: CodeSnippetResult;
  request: RequestState;
};

type AppAction =
  | { type: "initialize"; config: CodeSnippetProjectConfig }
  | { type: "set-language"; language: CodeSnippetLanguage }
  | { type: "set-source"; language: CodeSnippetLanguage; source: string }
  | { type: "set-typescript-profile"; profileId: string }
  | { type: "set-settings"; settings: CodeSnippetSettings }
  | { type: "set-output-view"; outputView: OutputView }
  | { type: "processing" }
  | { type: "processed"; result: CodeSnippetResult; elapsedMs: number }
  | { type: "failed"; error: ApiErrorPayload };

const LUA_SAMPLE = `-- Edit this source or paste a larger Lua sample.
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

const TYPESCRIPT_SAMPLE = `// Edit this source or select a project TypeScript profile.
function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  return dx * dx + dy * dy;
}

export function TIC(): void {
  const near = distanceSquared(2, 3, 8, 9) < 100;
  trace(near ? "near" : "far");
}
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

const sourceStorageKeys: Record<CodeSnippetLanguage, string> = {
  lua: "ticbuild.code-pipeline.source.lua",
  typescript: "ticbuild.code-pipeline.source.typescript",
};

function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage is optional; processing should continue when it is unavailable.
  }
}

function initialState(): AppState {
  const storedLanguage = readStoredValue("ticbuild.code-pipeline.language");
  const language: CodeSnippetLanguage = storedLanguage === "typescript" ? "typescript" : "lua";
  return {
    language,
    sources: {
      lua: readStoredValue(sourceStorageKeys.lua)
        ?? readStoredValue("ticbuild.lua-optimizer.source")
        ?? LUA_SAMPLE,
      typescript: readStoredValue(sourceStorageKeys.typescript) ?? TYPESCRIPT_SAMPLE,
    },
    typeScriptProfileId: readStoredValue("ticbuild.code-pipeline.typescript-profile") ?? "defaults",
    settings: null,
    outputView: "minified",
    request: { kind: "idle" },
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "initialize": {
      const selectedProfile = action.config.typeScriptProfiles.some(
        (profile) => profile.id === state.typeScriptProfileId,
      )
        ? state.typeScriptProfileId
        : action.config.defaultTypeScriptProfileId;
      return {
        ...state,
        typeScriptProfileId: selectedProfile,
        settings: structuredClone(action.config.settings),
      };
    }
    case "set-language":
      return { ...state, language: action.language };
    case "set-source":
      return {
        ...state,
        sources: { ...state.sources, [action.language]: action.source },
      };
    case "set-typescript-profile":
      return { ...state, typeScriptProfileId: action.profileId };
    case "set-settings":
      return { ...state, settings: action.settings };
    case "set-output-view":
      return { ...state, outputView: action.outputView };
    case "processing":
      return { ...state, request: { kind: "loading" } };
    case "processed":
      return {
        ...state,
        result: action.result,
        request: { kind: "ready", elapsedMs: action.elapsedMs },
      };
    case "failed":
      return { ...state, request: { kind: "error", error: action.error } };
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${new Intl.NumberFormat().format(bytes)} B (${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KiB)`;
}

function cloneOptions(options: OptimizationRuleOptions): LuaMinificationConfig {
  return structuredClone(options);
}

function formatApiError(error: ApiErrorPayload): string {
  const location = error.line === undefined || /^\[\d+:\d+\]/.test(error.message)
    ? ""
    : ` at ${error.line}:${error.column ?? 0}`;
  return `${error.message}${location}`;
}

function stageLabel(stage: CodeSnippetStage | undefined): string {
  switch (stage) {
    case "typescript":
      return "TypeScript transpilation";
    case "preprocessor":
      return "Lua preprocessing";
    case "optimizer":
      return "Lua optimization";
    default:
      return "Processing";
  }
}

function outputFor(result: CodeSnippetResult | undefined, view: OutputView): string {
  if (!result) return "";
  switch (view) {
    case "generated":
      return result.generatedLuaSource;
    case "preprocessed":
      return result.preprocessedSource;
    case "minified":
      return result.minifiedSource;
  }
}

function outputLabel(language: CodeSnippetLanguage, view: OutputView): string {
  switch (view) {
    case "generated":
      return language === "typescript" ? "Generated Lua" : "Input Lua";
    case "preprocessed":
      return "Preprocessed Lua";
    case "minified":
      return "Minified Lua";
  }
}

function App(): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [projectConfig, setProjectConfig] = useState<CodeSnippetProjectConfig>();
  const [configError, setConfigError] = useState<string>();
  const [copyLabel, setCopyLabel] = useState("Copy");
  const source = state.sources[state.language];
  const output = outputFor(state.result, state.outputView);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/code-pipeline/config", { signal: controller.signal });
        const body = await response.json() as ConfigResponse | { error: ApiErrorPayload };
        if (!response.ok || "error" in body) {
          const error = "error" in body ? body.error : { message: `HTTP ${response.status}` };
          throw new Error(formatApiError(error));
        }
        setProjectConfig(body.config);
        dispatch({ type: "initialize", config: body.config });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setConfigError(error instanceof Error ? error.message : String(error));
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    writeStoredValue("ticbuild.code-pipeline.language", state.language);
  }, [state.language]);

  useEffect(() => {
    writeStoredValue(sourceStorageKeys.lua, state.sources.lua);
  }, [state.sources.lua]);

  useEffect(() => {
    writeStoredValue(sourceStorageKeys.typescript, state.sources.typescript);
  }, [state.sources.typescript]);

  useEffect(() => {
    writeStoredValue("ticbuild.code-pipeline.typescript-profile", state.typeScriptProfileId);
  }, [state.typeScriptProfileId]);

  useEffect(() => {
    if (!projectConfig || !state.settings) return;
    const controller = new AbortController();
    dispatch({ type: "processing" });
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch("/api/code-pipeline/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language: state.language,
              source,
              typeScriptProfileId: state.language === "typescript" ? state.typeScriptProfileId : undefined,
              settings: state.settings,
            }),
            signal: controller.signal,
          });
          const body = await response.json() as ProcessResponse | { error: ApiErrorPayload };
          if (!response.ok || "error" in body) {
            const error = "error" in body ? body.error : { message: `HTTP ${response.status}` };
            dispatch({ type: "failed", error });
            return;
          }
          dispatch({ type: "processed", result: body.result, elapsedMs: body.elapsedMs });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          dispatch({
            type: "failed",
            error: { message: error instanceof Error ? error.message : String(error) },
          });
        }
      })();
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [projectConfig, source, state.language, state.typeScriptProfileId, state.settings]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy failed");
    }
    window.setTimeout(() => setCopyLabel("Copy"), 900);
  };

  const selectedProfile = projectConfig?.typeScriptProfiles.find(
    (profile) => profile.id === state.typeScriptProfileId,
  );
  const activeRuleStates = state.result?.ruleStates ?? projectConfig?.ruleStates ?? [];
  const outputIsStale = !!state.result && state.request.kind !== "ready";
  const inputBytes = new TextEncoder().encode(source).length;

  return (
    <>
      <header className="app-header">
        <div>
          <h1>ticbuild code pipeline lab</h1>
        </div>
        <div className="project-summary">
          <div id="project-name">
            {projectConfig ? `${projectConfig.projectName} · ${projectConfig.buildConfig}` : "Loading project…"}
          </div>
          <div id="project-path" title={projectConfig?.manifestPath}>{projectConfig?.manifestPath}</div>
        </div>
      </header>

      <main className="app-layout">
        <section className="code-workspace" aria-label="Code source and Lua pipeline output">
          <article className="code-panel">
            <div className="panel-header source-panel-header">
              <div>
                <h2>{state.language === "typescript" ? "TypeScript source" : "Lua source"}</h2>
                {state.language === "typescript" && selectedProfile && (
                  <div className="source-path" title={selectedProfile.sourcePath}>{selectedProfile.sourcePath}</div>
                )}
              </div>
              <div className="source-actions">
                <label className="compact-control">
                  <span>Language</span>
                  <select
                    aria-label="Input language"
                    value={state.language}
                    onChange={(event) => dispatch({
                      type: "set-language",
                      language: event.currentTarget.value as CodeSnippetLanguage,
                    })}
                  >
                    <option value="lua">Lua</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </label>
                {state.language === "typescript" && projectConfig && (
                  <label className="compact-control profile-control">
                    <span>Profile</span>
                    <select
                      aria-label="TypeScript profile"
                      value={state.typeScriptProfileId}
                      onChange={(event) => dispatch({
                        type: "set-typescript-profile",
                        profileId: event.currentTarget.value,
                      })}
                    >
                      {projectConfig.typeScriptProfiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>{profile.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <span className="metric">{formatBytes(inputBytes)}</span>
              </div>
            </div>
            <textarea
              value={source}
              onChange={(event) => dispatch({
                type: "set-source",
                language: state.language,
                source: event.currentTarget.value,
              })}
              spellCheck={false}
              aria-label={`${state.language === "typescript" ? "TypeScript" : "Lua"} source`}
            />
          </article>

          <article className={`code-panel${outputIsStale ? " stale" : ""}`}>
            <div className="panel-header">
              <div>
                <h2>{outputLabel(state.language, state.outputView)}</h2>
              </div>
              <div className="output-actions">
                <select
                  value={state.outputView}
                  onChange={(event) => dispatch({
                    type: "set-output-view",
                    outputView: event.currentTarget.value as OutputView,
                  })}
                  aria-label="Output pipeline stage"
                >
                  <option value="generated">
                    {state.language === "typescript" ? "Generated Lua" : "Input Lua"}
                  </option>
                  <option value="preprocessed">Preprocessed Lua</option>
                  <option value="minified">Minified Lua</option>
                </select>
                <button type="button" onClick={() => void copyOutput()} disabled={!state.result}>{copyLabel}</button>
              </div>
            </div>
            <textarea value={output} spellCheck={false} readOnly aria-label="Lua pipeline output" />
          </article>

          <Diagnostics
            configError={configError}
            request={state.request}
            result={state.result}
          />
        </section>

        {projectConfig && state.settings
          ? (
            <OptimizerSettings
              config={projectConfig}
              settings={state.settings}
              ruleStates={activeRuleStates}
              onSettingsChange={(settings) => dispatch({ type: "set-settings", settings })}
            />
          )
          : <aside className="settings-panel" aria-label="Optimizer settings" />}
      </main>
    </>
  );
}

function Diagnostics({
  configError,
  request,
  result,
}: {
  configError?: string;
  request: RequestState;
  result?: CodeSnippetResult;
}): React.JSX.Element {
  let statusKind: "loading" | "ready" | "error" = "loading";
  let status = "Loading project…";
  if (configError) {
    statusKind = "error";
    status = configError;
  } else if (request.kind === "loading") {
    status = result ? "Processing… showing last valid output" : "Processing…";
  } else if (request.kind === "ready" && result) {
    statusKind = "ready";
    const dependencyLabel = `${result.dependencies.length} source file${result.dependencies.length === 1 ? "" : "s"}`;
    status = `Ready · ${request.elapsedMs.toFixed(1)} ms · ${dependencyLabel}`;
  } else if (request.kind === "error") {
    statusKind = "error";
    const staleSuffix = result ? " — showing last valid output" : "";
    status = `${stageLabel(request.error.stage)} failed${staleSuffix}: ${formatApiError(request.error)}`;
  }

  return (
    <section className="diagnostics" aria-live="polite">
      <div className="status" data-kind={statusKind}>{status}</div>
      {result && <PipelineStats result={result} />}
    </section>
  );
}

function PipelineStats({ result }: { result: CodeSnippetResult }): React.JSX.Element {
  const baseline = Math.max(result.sizes.inputBytes, 1);
  const stats: Array<{ label: string; bytes: number }> = [
    { label: result.language === "typescript" ? "TypeScript" : "Input Lua", bytes: result.sizes.inputBytes },
  ];
  if (result.language === "typescript") {
    stats.push({ label: "Generated Lua", bytes: result.sizes.generatedBytes });
  }
  stats.push(
    { label: "Preprocessed Lua", bytes: result.sizes.preprocessedBytes },
    { label: "Minified Lua", bytes: result.sizes.minifiedBytes },
  );
  const saved = result.sizes.preprocessedBytes - result.sizes.minifiedBytes;
  const percent = result.sizes.preprocessedBytes === 0
    ? 0
    : (saved / result.sizes.preprocessedBytes) * 100;

  return (
    <div className="stats">
      {stats.map((stat) => (
        <div
          key={stat.label}
          data-value-norm01={Math.min(stat.bytes / baseline, 1)}
          style={{ "--value-norm01": Math.min(stat.bytes / baseline, 1) } as React.CSSProperties}
        >
          <span>{stat.label}</span>
          <strong>{formatBytes(stat.bytes)}</strong>
        </div>
      ))}
      <div className="stat-delta">
        <span>Optimizer delta</span>
        <strong>{saved >= 0 ? "−" : "+"}{formatBytes(Math.abs(saved))} ({percent.toFixed(1)}%)</strong>
      </div>
    </div>
  );
}

function OptimizerSettings({
  config,
  settings,
  ruleStates,
  onSettingsChange,
}: {
  config: CodeSnippetProjectConfig;
  settings: CodeSnippetSettings;
  ruleStates: LuaOptimizationRuleState[];
  onSettingsChange: (settings: CodeSnippetSettings) => void;
}): React.JSX.Element {
  const optionRecord = settings.minificationOverrides as Record<string, unknown>;
  const setOption = (key: string, value: unknown) => {
    onSettingsChange({
      ...settings,
      minificationOverrides: {
        ...settings.minificationOverrides,
        [key]: value,
      } as LuaMinificationConfig,
    });
  };
  const applyPreset = (name: PresetName) => {
    onSettingsChange({
      minifyEnabled: name === "project" ? config.settings.minifyEnabled : true,
      minificationOverrides: cloneOptions(config.presets[name]),
    });
  };

  return (
    <aside className="settings-panel" aria-label="Optimizer settings">
      <div className="settings-heading">
        <div><h2>Optimizer settings</h2></div>
        <label className="master-toggle">
          <input
            type="checkbox"
            checked={settings.minifyEnabled}
            onChange={(event) => onSettingsChange({
              ...settings,
              minifyEnabled: event.currentTarget.checked,
            })}
          />
          <span>Minify</span>
        </label>
      </div>

      <div className="preset-row" aria-label="Optimizer presets">
        {(["project", "release", "max"] as const).map((preset) => (
          <button key={preset} type="button" onClick={() => applyPreset(preset)}>
            {preset[0].toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>

      <section>
        <h3>Pass groups</h3>
        <div className="control-list">
          {booleanOptions.map(([key, label]) => (
            <label className="toggle-row" key={key}>
              <span>{label}</span>
              <input
                type="checkbox"
                checked={optionRecord[key] === true}
                onChange={(event) => setOption(key, event.currentTarget.checked)}
              />
            </label>
          ))}
        </div>
      </section>

      <details>
        <summary>Printer and symbol settings</summary>
        <div className="control-list advanced-controls">
          <LabeledControl label="Line behavior">
            <select
              value={String(optionRecord.lineBehavior ?? "tight")}
              onChange={(event) => setOption("lineBehavior", event.currentTarget.value)}
            >
              {(["pretty", "tight", "tight2", "single-line-blocks", "traceable"] as const).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </LabeledControl>

          <LabeledControl label="Global renaming">
            <select
              value={String(optionRecord.globalSymbolRenaming ?? "opt-in")}
              onChange={(event) => setOption("globalSymbolRenaming", event.currentTarget.value)}
            >
              {(["off", "opt-in", "opt-out"] as const).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </LabeledControl>

          {([
            ["maxIndentLevel", "Maximum indent", 0],
            ["maxLineLength", "Maximum line length", 20],
          ] as const).map(([key, label, minimum]) => (
            <LabeledControl key={key} label={label}>
              <input
                type="number"
                min={minimum}
                step={1}
                value={Number(optionRecord[key] ?? 0)}
                onChange={(event) => setOption(key, Number(event.currentTarget.value))}
              />
            </LabeledControl>
          ))}

          {listOptions.map(([key, label]) => (
            <ListControl
              key={key}
              label={label}
              values={Array.isArray(optionRecord[key]) ? optionRecord[key] as string[] : []}
              onCommit={(values) => setOption(key, values)}
            />
          ))}
        </div>
      </details>

      <details open>
        <summary>Individual rules</summary>
        <p className="settings-note">Inherit follows the pass-group setting. An explicit override wins.</p>
        <RuleOptions
          settings={settings}
          ruleStates={ruleStates}
          onRuleOverride={(ruleId, override) => {
            const nextOverrides: Partial<Record<OptimizationRuleId, boolean>> = {
              ...(settings.minificationOverrides.ruleOverrides ?? {}),
            };
            if (override === null) {
              delete nextOverrides[ruleId];
            } else {
              nextOverrides[ruleId] = override;
            }
            setOption("ruleOverrides", nextOverrides);
          }}
        />
      </details>
    </aside>
  );
}

function LabeledControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="setting-control">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ListControl({
  label,
  values,
  onCommit,
}: {
  label: string;
  values: string[];
  onCommit: (values: string[]) => void;
}): React.JSX.Element {
  const serialized = values.join(", ");
  const commit = (value: string) => onCommit(value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean));
  return (
    <LabeledControl label={label}>
      <input
        key={serialized}
        type="text"
        defaultValue={serialized}
        placeholder="comma-separated"
        onBlur={(event) => commit(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </LabeledControl>
  );
}

function RuleOptions({
  settings,
  ruleStates,
  onRuleOverride,
}: {
  settings: CodeSnippetSettings;
  ruleStates: LuaOptimizationRuleState[];
  onRuleOverride: (ruleId: OptimizationRuleId, override: boolean | null) => void;
}): React.JSX.Element {
  let previousFamily = "";
  return (
    <div className="rule-list">
      {ruleStates.map((rule) => {
        const showFamily = rule.family !== previousFamily;
        previousFamily = rule.family;
        const override = settings.minificationOverrides.ruleOverrides?.[rule.id as OptimizationRuleId];
        return (
          <Fragment key={rule.id}>
            {showFamily && <div className="rule-family">{rule.family}</div>}
            <div className="rule-row">
              <div>
                <div className="rule-title">{rule.id}</div>
                <div className="rule-description">{rule.description}</div>
              </div>
              <div className="rule-actions">
                <span className="rule-status" data-enabled={String(rule.enabled)}>
                  {rule.enabled ? "on" : "off"}
                </span>
                <select
                  aria-label={`${rule.id} override`}
                  value={override === undefined ? "inherit" : override ? "on" : "off"}
                  onChange={(event) => onRuleOverride(
                    rule.id as OptimizationRuleId,
                    event.currentTarget.value === "inherit" ? null : event.currentTarget.value === "on",
                  )}
                >
                  <option value="inherit">inherit</option>
                  <option value="on">on</option>
                  <option value="off">off</option>
                </select>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Missing #app");
createRoot(rootElement).render(<App />);
