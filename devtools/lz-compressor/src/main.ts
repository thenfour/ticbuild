import "./styles.css";
import {
  lzCompressBest,
  lzRleCompressBest,
  type LZCompressionResult,
} from "../../../src/utils/encoding/lz";
import {
  decodePayloadText,
  encodePayloadText,
  gPayloadTextEncodings,
  type PayloadTextEncoding,
} from "../../../src/utils/encoding/payloadTextEncoding";
import {
  encodePayloadOutput,
  gPayloadOutputEncodings,
  type PayloadOutputEncoding,
} from "../../../src/utils/encoding/payloadOutput";

const SAMPLE_SOURCE = `TIC-80 cartridges often contain repeated tables, sparse records, and text.
This playground compresses the decoded bytes with several hand-picked LZ configurations.
Change the input encoding buttons to convert this same payload without changing its bytes.

repeat: 00000000000000000000000000000000
repeat: 00000000000000000000000000000000
repeat: 00000000000000000000000000000000`;

const encodingLabels: Record<PayloadTextEncoding, string> = {
  hex: "HEX",
  utf8: "UTF-8",
  base64: "BASE64",
  "b85+1": "BASE85+1",
};

const outputFormatLabels: Record<PayloadOutputEncoding, string> = {
  hex: "HEX",
  base64: "BASE64",
  "b85+1": "BASE85+1",
};

const gCompressionMethods = ["none", "lz", "lzrle"] as const;
type CompressionMethod = (typeof gCompressionMethods)[number];

const compressionMethodLabels: Record<CompressionMethod, string> = {
  none: "None",
  lz: "LZ",
  lzrle: "LZRLE",
};

type CompressionSnapshot = {
  input: Uint8Array;
  data: Uint8Array;
  elapsedMs: number;
  method: CompressionMethod;
  lzResult?: LZCompressionResult;
};

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

function isPayloadTextEncoding(value: string | null): value is PayloadTextEncoding {
  return value !== null && gPayloadTextEncodings.some((encoding) => encoding === value);
}

function isPayloadOutputEncoding(value: string | null): value is PayloadOutputEncoding {
  return value !== null && gPayloadOutputEncodings.some((encoding) => encoding === value);
}

function isCompressionMethod(value: string | null): value is CompressionMethod {
  return value !== null && gCompressionMethods.some((method) => method === value);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${new Intl.NumberFormat().format(bytes)} B (${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KiB)`;
}

function formatDelta(inputBytes: number, outputBytes: number): string {
  const delta = inputBytes - outputBytes;
  const percent = inputBytes === 0 ? 0 : (delta / inputBytes) * 100;
  return `${delta >= 0 ? "−" : "+"}${formatBytes(Math.abs(delta))} (${Math.abs(percent).toFixed(1)}%)`;
}

const sourceElement = requiredElement<HTMLTextAreaElement>("source");
const outputElement = requiredElement<HTMLTextAreaElement>("output");
const outputPanel = requiredElement<HTMLElement>("output-panel");
const copyOutput = requiredElement<HTMLButtonElement>("copy-output");
const luaLiteralToggle = requiredElement<HTMLButtonElement>("lua-literal-toggle");
const statusElement = requiredElement<HTMLElement>("status");
const statsElement = requiredElement<HTMLElement>("stats");
const attemptsElement = requiredElement<HTMLTableSectionElement>("attempts");
const attemptsNoteElement = requiredElement<HTMLElement>("attempts-note");
const inputSummaryElement = requiredElement<HTMLElement>("input-summary");
const outputFormatElement = requiredElement<HTMLElement>("output-format");
const outputNoteElement = requiredElement<HTMLElement>("output-note");
const inputEncodingButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-input-encoding]"));
const outputFormatButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-output-format]"));
const compressionMethodButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-compression-method]"),
);

let activeInputEncoding: PayloadTextEncoding = "utf8";
let activeOutputFormat: PayloadOutputEncoding = "b85+1";
let activeCompressionMethod: CompressionMethod = "lz";
let wrapOutputAsLuaLiteral = false;
let debounceHandle: number | undefined;
let latestCompression: CompressionSnapshot | undefined;

function setStatus(message: string, kind: "loading" | "ready" | "error"): void {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}

function updateRadioButtons(buttons: HTMLButtonElement[], selectedValue: string, dataKey: string): void {
  for (const button of buttons) {
    const selected = button.dataset[dataKey] === selectedValue;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-checked", String(selected));
  }
}

function updateControls(): void {
  updateRadioButtons(inputEncodingButtons, activeInputEncoding, "inputEncoding");
  updateRadioButtons(outputFormatButtons, activeOutputFormat, "outputFormat");
  updateRadioButtons(compressionMethodButtons, activeCompressionMethod, "compressionMethod");
  luaLiteralToggle.setAttribute("aria-pressed", String(wrapOutputAsLuaLiteral));
}

function appendStat(label: string, value: string, valueAsNorm01?: number): void {
  const item = document.createElement("div");
  if (valueAsNorm01 !== undefined) {
    item.style.setProperty("--value-norm01", String(Math.max(0, Math.min(1, valueAsNorm01))));
    item.classList.add("stat-with-bar");
  }
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  item.append(labelElement, valueElement);
  statsElement.append(item);
}

function setAttemptSize(
  row: HTMLTableRowElement,
  size: HTMLTableCellElement,
  byteLength: number,
  inputBytes: number,
): void {
  const ratio = inputBytes === 0 ? 0 : (byteLength / inputBytes) * 100;
  size.textContent = `${byteLength} (${ratio.toFixed(1)}%)`;
  row.classList.add("attempt-with-bar");
  row.style.setProperty("--attempt-percent", `${Math.max(0, Math.min(100, ratio))}%`);
}

function renderAttempts(snapshot: CompressionSnapshot): void {
  attemptsElement.replaceChildren();
  if (!snapshot.lzResult) {
    attemptsNoteElement.textContent = "Compression is disabled; input bytes pass through unchanged.";
    const row = document.createElement("tr");
    row.classList.add("no-search");
    const name = document.createElement("td");
    name.textContent = "None";
    const config = document.createElement("td");
    config.textContent = "pass-through";
    const size = document.createElement("td");
    setAttemptSize(row, size, snapshot.data.length, snapshot.input.length);
    row.append(name, config, size);
    attemptsElement.append(row);
    return;
  }

  attemptsNoteElement.textContent =
    "Every row is encoded; the smallest result wins. Ties keep the earlier, more conservative preset.";
  for (const attempt of snapshot.lzResult.attempts) {
    const row = document.createElement("tr");
    if (attempt.presetName === snapshot.lzResult.presetName) row.classList.add("selected");
    const name = document.createElement("td");
    name.textContent = attempt.presetName;
    const config = document.createElement("td");
    config.textContent = `${attempt.config.windowSize} / ${attempt.config.minMatchLength} / ${attempt.config.maxMatchLength}`;
    const size = document.createElement("td");
    setAttemptSize(row, size, attempt.byteLength, snapshot.input.length);
    row.append(name, config, size);
    attemptsElement.append(row);
  }
}

function renderCompression(snapshot: CompressionSnapshot): void {
  const encodedOutput = encodePayloadOutput(snapshot.data, activeOutputFormat, wrapOutputAsLuaLiteral);
  const outputLabel = outputFormatLabels[activeOutputFormat];

  outputElement.value = encodedOutput;
  outputFormatElement.textContent = `${outputLabel}${wrapOutputAsLuaLiteral ? " · Lua string" : ""}`;
  outputNoteElement.textContent = wrapOutputAsLuaLiteral
    ? `${outputLabel} text wrapped with toLuaStringLiteral(), ready to paste directly into Lua source.`
    : `Output bytes encoded as ${outputLabel}. Enable Lua string to wrap this text as a Lua literal.`;
  outputPanel.classList.remove("stale");
  inputSummaryElement.textContent = `${formatBytes(snapshot.input.length)} · ${encodingLabels[activeInputEncoding]}`;

  statsElement.replaceChildren();
  appendStat("Decoded input", formatBytes(snapshot.input.length), 1);
  appendStat(
    "Output bytes",
    formatBytes(snapshot.data.length),
    snapshot.input.length === 0 ? 0 : snapshot.data.length / snapshot.input.length,
  );
  appendStat("Compression delta", formatDelta(snapshot.input.length, snapshot.data.length));
  appendStat("Encoded output", `${new Intl.NumberFormat().format(encodedOutput.length)} characters`);
  appendStat(
    "Compression",
    snapshot.lzResult
      ? `${compressionMethodLabels[snapshot.method]} · ${snapshot.lzResult.presetName}`
      : "None · pass-through",
  );
  renderAttempts(snapshot);

  const detail = snapshot.lzResult
    ? `${snapshot.elapsedMs.toFixed(1)} ms · tested ${snapshot.lzResult.attempts.length} presets`
    : "no compression";
  setStatus(`Ready · ${detail}`, "ready");
}

function processSource(): void {
  setStatus(activeCompressionMethod === "none" ? "Converting…" : "Compressing…", "loading");
  try {
    const input = decodePayloadText(sourceElement.value, activeInputEncoding);
    const started = performance.now();
    const lzResult = activeCompressionMethod === "lz"
      ? lzCompressBest(input)
      : activeCompressionMethod === "lzrle"
        ? lzRleCompressBest(input)
        : undefined;
    const snapshot: CompressionSnapshot = {
      input,
      data: lzResult?.data ?? input,
      elapsedMs: performance.now() - started,
      method: activeCompressionMethod,
      lzResult,
    };
    latestCompression = snapshot;
    renderCompression(snapshot);
  } catch (error) {
    latestCompression = undefined;
    outputPanel.classList.add("stale");
    setStatus(error instanceof Error ? error.message : String(error), "error");
  }
}

function scheduleProcess(delay = 160): void {
  if (debounceHandle !== undefined) window.clearTimeout(debounceHandle);
  debounceHandle = window.setTimeout(processSource, delay);
}

function persistState(): void {
  localStorage.setItem("ticbuild.lz-compressor.source", sourceElement.value);
  localStorage.setItem("ticbuild.lz-compressor.encoding", activeInputEncoding);
  localStorage.setItem("ticbuild.lz-compressor.output-format", activeOutputFormat);
  localStorage.setItem("ticbuild.lz-compressor.lua-literal", String(wrapOutputAsLuaLiteral));
  localStorage.setItem("ticbuild.lz-compressor.compression", activeCompressionMethod);
}

function selectInputEncoding(nextEncoding: PayloadTextEncoding): void {
  if (nextEncoding === activeInputEncoding) return;
  try {
    const bytes = decodePayloadText(sourceElement.value, activeInputEncoding);
    sourceElement.value = encodePayloadText(bytes, nextEncoding);
    activeInputEncoding = nextEncoding;
    updateControls();
    persistState();
    scheduleProcess(0);
  } catch (error) {
    setStatus(
      `Cannot convert ${encodingLabels[activeInputEncoding]} to ${encodingLabels[nextEncoding]}: ${error instanceof Error ? error.message : String(error)}`,
      "error",
    );
  }
}

function rerenderOutput(): void {
  updateControls();
  persistState();
  if (latestCompression) renderCompression(latestCompression);
}

function selectOutputFormat(nextFormat: PayloadOutputEncoding): void {
  if (nextFormat === activeOutputFormat) return;
  activeOutputFormat = nextFormat;
  rerenderOutput();
}

function toggleLuaLiteral(): void {
  wrapOutputAsLuaLiteral = !wrapOutputAsLuaLiteral;
  rerenderOutput();
}

function selectCompressionMethod(nextMethod: CompressionMethod): void {
  if (nextMethod === activeCompressionMethod) return;
  activeCompressionMethod = nextMethod;
  latestCompression = undefined;
  outputPanel.classList.add("stale");
  updateControls();
  persistState();
  scheduleProcess(0);
}

const storedEncoding = localStorage.getItem("ticbuild.lz-compressor.encoding");
if (isPayloadTextEncoding(storedEncoding)) activeInputEncoding = storedEncoding;
const storedOutputFormat = localStorage.getItem("ticbuild.lz-compressor.output-format");
if (isPayloadOutputEncoding(storedOutputFormat)) activeOutputFormat = storedOutputFormat;
const storedLuaLiteral = localStorage.getItem("ticbuild.lz-compressor.lua-literal");
if (storedLuaLiteral !== null) {
  wrapOutputAsLuaLiteral = storedLuaLiteral === "true";
} else if (storedOutputFormat === "lua") {
  // Migrate the earlier combined Lua output choice to the new independent toggle.
  wrapOutputAsLuaLiteral = true;
}
const storedCompression = localStorage.getItem("ticbuild.lz-compressor.compression");
if (isCompressionMethod(storedCompression)) activeCompressionMethod = storedCompression;
sourceElement.value = localStorage.getItem("ticbuild.lz-compressor.source") ?? SAMPLE_SOURCE;
updateControls();

sourceElement.addEventListener("input", () => {
  latestCompression = undefined;
  outputPanel.classList.add("stale");
  persistState();
  scheduleProcess();
});
for (const button of inputEncodingButtons) {
  button.addEventListener("click", () => {
    const encoding = button.dataset.inputEncoding ?? null;
    if (isPayloadTextEncoding(encoding)) selectInputEncoding(encoding);
  });
}
for (const button of outputFormatButtons) {
  button.addEventListener("click", () => {
    const format = button.dataset.outputFormat ?? null;
    if (isPayloadOutputEncoding(format)) selectOutputFormat(format);
  });
}
for (const button of compressionMethodButtons) {
  button.addEventListener("click", () => {
    const method = button.dataset.compressionMethod ?? null;
    if (isCompressionMethod(method)) selectCompressionMethod(method);
  });
}
luaLiteralToggle.addEventListener("click", toggleLuaLiteral);
copyOutput.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(outputElement.value);
    copyOutput.textContent = "Copied";
    window.setTimeout(() => { copyOutput.textContent = "Copy"; }, 900);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), "error");
  }
});

scheduleProcess(0);
