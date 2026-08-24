import { decodeHexString } from "../../utils/encoding/hex";

export interface ParsedRemotingResponseLine {
  kind: "response";
  id: number;
  status: string;
  data: string;
}

export interface ParsedRemotingEventLine {
  kind: "event";
  id: number;
  eventType: string;
  data: string;
}

export type ParsedRemotingLine = ParsedRemotingResponseLine | ParsedRemotingEventLine;

// Remoting represents arbitrary bytes as hex enclosed in angle brackets.
// e.g., <48656c6c6f20776f726c6421>
// Keep that wire-format detail here so consumers can work with bytes or decoded
// payloads instead of repeating delimiter, hexadecimal, and UTF-8 validation.
export function decodeRemotingBinaryLiteral(value: string): Uint8Array {
  const token = value.trim();
  if (!token.startsWith("<") || !token.endsWith(">")) {
    throw new Error("Remoting value must be a binary literal enclosed in '<' and '>'");
  }
  return decodeHexString(token.slice(1, -1));
}

export function decodeRemotingJsonBinaryLiteral(value: string): unknown {
  const bytes = decodeRemotingBinaryLiteral(value);
  const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return JSON.parse(json) as unknown;
}

export function parseRemotingLine(line: string): ParsedRemotingLine | undefined {
  const match = /^([^\s]+)\s+([^\s]+)\s*(.*)$/.exec(line);
  if (!match) {
    return undefined;
  }

  const id = Number(match[1]);
  if (!Number.isInteger(id)) {
    return undefined;
  }

  const token = match[2];
  const data = match[3] ?? "";
  if (id < 0) {
    return {
      kind: "event",
      id,
      eventType: token,
      data,
    };
  }

  return {
    kind: "response",
    id,
    status: token.toUpperCase(),
    data,
  };
}
