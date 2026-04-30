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
