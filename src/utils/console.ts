import chalk from "chalk";
import { appendFileSync } from "node:fs";

let logFilePath: string | null = null;

// message sink is needed to route all console messages so that the jsonl reporter can capture them
export type ConsoleMessageLevel = "success" | "error" | "warning" | "info" | "debug";
export type ConsoleMessageSink = (level: ConsoleMessageLevel, message: string) => void;

let consoleMessageSink: ConsoleMessageSink | null = null;

function isTestEnv(): boolean {
  return process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;
}

function consoleLogExceptInTestEnv(level: ConsoleMessageLevel, plainMessage: string, decoratedMessage: any): void {
  if (consoleMessageSink) {
    consoleMessageSink(level, plainMessage);
    return;
  }
  if (!isTestEnv()) {
    console.log(decoratedMessage);
  }
}

export function setConsoleMessageSink(sink: ConsoleMessageSink | null): void {
  consoleMessageSink = sink;
}

export function getConsoleMessageSink(): ConsoleMessageSink | null {
  return consoleMessageSink;
}

export function setLogFile(filePath: string | null): void {
  logFilePath = filePath;
}

export function getLogFile(): string | null {
  return logFilePath;
}

function writeToLog(level: string, message: string): void {
  if (!logFilePath) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  appendFileSync(logFilePath, logLine, "utf-8");
}

export function success(message: string): void {
  consoleLogExceptInTestEnv("success", message, chalk.green(message));
  writeToLog("SUCCESS", message);
}

export function error(message: string): void {
  consoleLogExceptInTestEnv("error", message, chalk.red(message));
  writeToLog("ERROR", message);
}

export function warning(message: string): void {
  consoleLogExceptInTestEnv("warning", message, chalk.bgHex(`#FFA500`).black(`WARNING: ${message}`));
  writeToLog("WARNING", message);
}

// export function info(message: string): void {
//   console.log(chalk.blue(message));
//   writeToLog("INFO", message);
// }

export function info(message: string): void {
  consoleLogExceptInTestEnv("info", message, chalk.blue(message));
  writeToLog("INFO", message);
}

export function dim(message: string): void {
  consoleLogExceptInTestEnv("debug", message, chalk.gray(message));
  writeToLog("DEBUG", message);
}

export function bold(message: string): void {
  consoleLogExceptInTestEnv("info", message, chalk.bold(message));
  writeToLog("INFO", message);
}

export function h1(message: string): void {
  //const decorated = chalk.bold.underline(message);
  const decorated = chalk.cyanBright(`${message}`);
  consoleLogExceptInTestEnv("info", message, decorated);
  writeToLog("INFO", message);
}
