export const buildReportVersion = 1;

export type BuildReporterName = "human" | "jsonl";

export type BuildDiagnosticSeverity = "warning" | "error";

export type LuaCodeSizeEntry = {
  chunkType: "CODE" | "CODE_COMPRESSED";
  sizeBytes: number;
  capacityBytes: number;
  banksUsed: number;
  banksAvailable: number;
  compressionMode?: string;
};

export type CartChunkUsageEntry = {
  chunkType: string;
  bank: number;
  sizeBytes: number;
  capacityBytes: number | null;
};

export type BuildMessageDataByType = {
  "project.loadedFrom": {
    manifestPath: string;
  };
  "manifest.resolved": {
    resolvedManifestPath: string;
  };
  comment: {
    message: string;
  };
  diagnostic: {
    severity: BuildDiagnosticSeverity;
    message: string;
  };
  "lua.codeSize": {
    importName: string;
    chunks: LuaCodeSizeEntry[];
  };
  "cart.usage": {
    chunks: CartChunkUsageEntry[];
    totalSizeBytes: number;
  };
  "build.completed": {
    durationMs: number;
    logPath: string;
    cartPath: string;
  };
  "build.failed": {
    message: string;
  };
};

export type StructuredBuildMessage = {
  [Type in keyof BuildMessageDataByType]: {
    type: Type;
    data: BuildMessageDataByType[Type];
    humanReadable: () => void;
  };
}[keyof BuildMessageDataByType];

export type HumanOnlyBuildMessage = {
  type: null;
  humanReadable: () => void;
};

export type BuildMessage = StructuredBuildMessage | HumanOnlyBuildMessage;

export interface BuildReporter {
  readonly name: BuildReporterName;
  message(message: BuildMessage): void;
}

export class HumanBuildReporter implements BuildReporter {
  readonly name = "human" as const;

  message(message: BuildMessage): void {
    message.humanReadable();
  }
}

export type JsonlWriter = (line: string) => void;

export class JsonlBuildReporter implements BuildReporter {
  readonly name = "jsonl" as const;

  constructor(private readonly writeLine: JsonlWriter = (line) => process.stdout.write(`${line}\n`)) {}

  message(message: BuildMessage): void {
    if (message.type === null) {
      return;
    }

    this.writeLine(
      JSON.stringify({
        version: buildReportVersion,
        type: message.type,
        data: message.data,
      }),
    );
  }
}

export function createBuildReporter(name: string | undefined, writeJsonlLine?: JsonlWriter): BuildReporter {
  switch (name ?? "human") {
    case "human":
      return new HumanBuildReporter();
    case "jsonl":
      return new JsonlBuildReporter(writeJsonlLine);
    default:
      throw new Error(`Unsupported build reporter '${name}'. Expected 'human' or 'jsonl'.`);
  }
}
