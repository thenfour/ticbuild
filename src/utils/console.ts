import chalk from "chalk";
import { appendFileSync } from "node:fs";

let logFilePath: string | null = null;

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
  console.log(chalk.green(message));
  writeToLog("SUCCESS", message);
}

export function error(message: string): void {
  console.error(chalk.red(message));
  writeToLog("ERROR", message);
}

export function warning(message: string): void {
  console.warn(chalk.bgHex(`#FFA500`).black(`WARNING: ${message}`));
  writeToLog("WARNING", message);
}

// export function info(message: string): void {
//   console.log(chalk.blue(message));
//   writeToLog("INFO", message);
// }

export function info(message: string): void {
  console.log(message);
  writeToLog("INFO", message);
}

export function dim(message: string): void {
  console.log(chalk.gray(message));
  writeToLog("DEBUG", message);
}

export function bold(message: string): void {
  console.log(chalk.bold(message));
  writeToLog("INFO", message);
}

export function h1(message: string): void {
  //const decorated = chalk.bold.underline(message);
  const decorated = chalk.cyanBright(`${message}`);
  console.log(decorated);
  writeToLog("INFO", message);
}
