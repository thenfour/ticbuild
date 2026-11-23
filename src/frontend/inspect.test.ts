import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as cons from "../utils/console";
import { inspectCommand } from "./inspect";

describe("inspect command", () => {
  let dir: string;
  let messages: { level: cons.ConsoleMessageLevel; message: string }[];
  let previousSink: cons.ConsoleMessageSink | null;
  let previousLogFile: string | null;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-inspect-"));
    messages = [];
    previousSink = cons.getConsoleMessageSink();
    previousLogFile = cons.getLogFile();
    cons.setConsoleMessageSink((level, message) => messages.push({ level, message }));
    cons.setLogFile(null);
  });

  afterEach(() => {
    cons.setConsoleMessageSink(previousSink);
    cons.setLogFile(previousLogFile);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function output(): string {
    return messages.map(({ message }) => message).join("\n");
  }

  it("reports physical code banks, unknown chunks and file size including all headers", async () => {
    const cartPath = path.join(dir, "my cart.tic");
    const bytes = Buffer.from([
      (1 << 5) | 5, 3, 0, 0, 0x61, 0x62, 0x63,
      5, 2, 0, 0, 0x64, 0x65,
      (3 << 5) | 1, 1, 0, 0, 42,
      (7 << 5) | 31, 2, 0, 0, 0x77, 0,
    ]);
    fs.writeFileSync(cartPath, bytes);

    await inspectCommand(path.relative(process.cwd(), cartPath));

    expect(output()).toContain(`Cart: ${cartPath}`);
    expect(output()).toContain("Chunks: 4");
    expect(output()).toMatch(/^\s+CODE:1\s+3 B\s*\/\s*64\.0 KB/m);
    expect(output()).toMatch(/^\s+CODE\s+2 B\s*\/\s*64\.0 KB/m);
    expect(output()).toMatch(/^\s+TILES:3\s+1 B\s*\/\s*8\.0 KB/m);
    expect(output()).toMatch(/^\s+UNKNOWN\(31\):7\s+2 B\s*\/\s*n\/a\s*$/m);
    expect(output()).toContain("Total cart size: 24 B");
    expect(messages).toContainEqual({
      level: "warning",
      message: expect.stringContaining("Unknown TIC-80 chunk type 31"),
    });
    expect(fs.readFileSync(cartPath)).toEqual(bytes);
    expect(fs.readdirSync(dir)).toEqual(["my cart.tic"]);
  });

  it("reports compressed payload sizes without attempting decompression", async () => {
    const cartPath = path.join(dir, "compressed.tic");
    fs.writeFileSync(cartPath, Buffer.from([16, 3, 0, 0, 0xff, 0xff, 0xff]));

    await inspectCommand(cartPath);

    expect(output()).toContain("Chunks: 1");
    expect(output()).toMatch(/CODE_COMPRESSED\s+3 B\s*\//);
    expect(output()).toContain("Total cart size: 7 B");
    expect(messages.some(({ level }) => level === "warning" || level === "error")).toBe(false);
  });

  it("reports a full CODE bank encoded by a zero size field", async () => {
    const cartPath = path.join(dir, "full-bank.tic");
    fs.writeFileSync(cartPath, Buffer.concat([
      Buffer.from([(2 << 5) | 5, 0, 0, 0]),
      Buffer.alloc(65536, 0xff),
    ]));

    await inspectCommand(cartPath);

    expect(output()).toContain("Chunks: 1");
    expect(output()).toMatch(/CODE:2\s+64\.0 KB\s*\/\s*64\.0 KB\s+\[#{20}\]\s+100\.0%/);
  });

  it("reports zero chunks and size for an empty cart", async () => {
    const cartPath = path.join(dir, "empty.tic");
    fs.writeFileSync(cartPath, new Uint8Array());

    await inspectCommand(cartPath);

    expect(output()).toContain("Chunks: 0");
    expect(output()).toContain("Total cart size: 0 B");
  });

  it("propagates file read errors without reporting a successful inspection", async () => {
    await expect(inspectCommand(path.join(dir, "missing.tic"))).rejects.toMatchObject({ code: "ENOENT" });
    expect(messages).toEqual([]);
  });

  it.each<[number[], string]>([
    [[1, 2, 0], "Unexpected end of data while reading chunk header"],
    [[31, 2, 0, 0, 42], "Unexpected end of data while reading chunk data"],
  ])("propagates malformed cart errors for %j", async (bytes, error) => {
    const cartPath = path.join(dir, "truncated.tic");
    fs.writeFileSync(cartPath, Buffer.from(bytes));

    await expect(inspectCommand(cartPath)).rejects.toThrow(error);
    expect(messages).toEqual([]);
  });
});
