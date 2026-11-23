import { kTic80CartChunkTypes } from "../utils/tic80/tic80";
import { formatBytes } from "../utils/utils";
import type { CartChunkUsageEntry } from "./buildReporter";

export function buildCartStatsLines(
  chunks: { chunkType: string; bank: number; size: number }[],
  indent: string,
  totalSizeOverride?: number,
): string[] {
  return formatCartUsageLines(buildCartUsage(chunks, totalSizeOverride), indent);
}

export function buildCartUsage(
  chunks: { chunkType: string; bank: number; size: number }[],
  totalSizeOverride?: number,
): { chunks: CartChunkUsageEntry[]; totalSizeBytes: number } {
  if (chunks.length === 0) {
    return {
      chunks: [],
      totalSizeBytes: totalSizeOverride ?? 0,
    };
  }

  const sizeByType = new Map<string, number>();
  for (const chunk of chunks) {
    const key = formatChunkKey(chunk.chunkType, chunk.bank);
    sizeByType.set(key, (sizeByType.get(key) || 0) + chunk.size);
  }

  const rows: CartChunkUsageEntry[] = Array.from(sizeByType.entries()).map(([chunkKey, size]) => {
    const { chunkType, bank } = parseChunkKey(chunkKey);
    const info = kTic80CartChunkTypes.coerceByKey(chunkType);
    return {
      chunkType,
      bank,
      sizeBytes: size,
      capacityBytes: info ? info.sizePerBank : null,
    };
  });

  const totalSize = totalSizeOverride ?? chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  return {
    chunks: rows,
    totalSizeBytes: totalSize,
  };
}

export function formatCartUsageLines(
  usage: { chunks: CartChunkUsageEntry[]; totalSizeBytes: number },
  indent: string,
): string[] {
  if (usage.chunks.length === 0) {
    return [];
  }

  const labelWidth = Math.max(...usage.chunks.map((row) => formatChunkKey(row.chunkType, row.bank).length), 5);
  const sizeWidth = Math.max(...usage.chunks.map((row) => formatBytes(row.sizeBytes).length), 5);
  const capWidth = Math.max(
    ...usage.chunks.map((row) => (row.capacityBytes !== null ? formatBytes(row.capacityBytes).length : 3)),
    3,
  );

  const lines: string[] = [];
  lines.push(`${indent}Chunk usage:`);
  for (const row of usage.chunks) {
    const label = formatChunkKey(row.chunkType, row.bank).padEnd(labelWidth, " ");
    const sizeStr = formatBytes(row.sizeBytes).padStart(sizeWidth, " ");
    const capStrRaw = row.capacityBytes !== null ? formatBytes(row.capacityBytes) : "n/a";
    const capStr = capStrRaw.padStart(capWidth, " ");
    const meter = row.capacityBytes !== null ? formatUsageMeter(row.sizeBytes, row.capacityBytes) : "";
    const usageText = row.capacityBytes !== null ? `${meter} ${formatPercent(row.sizeBytes, row.capacityBytes)}` : "";
    lines.push(`${indent}  ${label}  ${sizeStr} / ${capStr}${usageText ? " " + usageText : ""}`);
  }
  lines.push(`${indent}Total cart size: ${formatBytes(usage.totalSizeBytes)}`);
  return lines;
}

export function formatChunkKey(chunkType: string, bank: number): string {
  return bank === 0 ? chunkType : `${chunkType}:${bank}`;
}

// because we store chunks as the string keys and not structured ... so this is sloppy but whatev
function parseChunkKey(chunkKey: string): { chunkType: string; bank: number } {
  const colonIndex = chunkKey.lastIndexOf(":");
  if (colonIndex < 0) {
    return { chunkType: chunkKey, bank: 0 };
  }
  const chunkType = chunkKey.slice(0, colonIndex);
  const bankText = chunkKey.slice(colonIndex + 1);
  const bank = Number.parseInt(bankText, 10);
  return { chunkType, bank: Number.isFinite(bank) ? bank : 0 };
}


/*
other options

[##########----------]

[■■■■■■■□□□]

|███████████████-----|

█████▒▒▒▒▒ 50%

［ ￭￭￭￭￭･････ ］


*/
function formatUsageMeter(size: number, capacity: number, width: number = 20): string {
  const ratio = capacity > 0 ? Math.min(size / capacity, 1) : 0;
  const filled = Math.ceil(ratio * width); // round up to show progress even for small sizes
  const bar = "#".repeat(filled) + "-".repeat(width - filled);
  return `[${bar}]`;
}

// returns a string like "50.0%" or "100.0%" or "" if capacity is 0
function formatPercent(size: number, capacity: number): string {
  if (capacity <= 0) return "";
  const pct = ((size / capacity) * 100).toFixed(1);
  return `${pct}%`;
}
