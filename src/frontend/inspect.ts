import * as path from "node:path";
import * as cons from "../utils/console";
import { readBinaryFileAsync } from "../utils/fileSystem";
import { parseTic80Cart } from "../utils/tic80/cartLoader";
import { formatTic80CartChunkType } from "../utils/tic80/tic80";
import { formatBytes } from "../utils/utils";
import { buildCartStatsLines } from "./cartUsage";

export async function inspectCommand(cartPath: string): Promise<void> {
  const absolutePath = path.resolve(cartPath);
  const data = await readBinaryFileAsync(absolutePath);
  const cart = parseTic80Cart(data);
  const lines = buildCartStatsLines(
    cart.chunks.map(({ chunkType, bank, data }) => ({
      chunkType: formatTic80CartChunkType(chunkType),
      bank,
      size: data.length,
    })),
    "",
    data.length,
  );

  cons.h1(`Cart: ${absolutePath}`);
  cons.info(`Chunks: ${cart.chunks.length}`);
  for (const line of lines) {
    cons.info(line);
  }
  if (cart.chunks.length === 0) {
    cons.info(`Total cart size: ${formatBytes(data.length)}`);
  }
}
