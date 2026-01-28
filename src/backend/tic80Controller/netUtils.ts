import net from "node:net";
import * as cons from "../../utils/console";

export async function findRandomFreePortInRange(minPort: number, maxPort: number, host: string): Promise<number> {
  const rangeSize = maxPort - minPort + 1;
  if (rangeSize <= 0) {
    throw new Error(`Invalid port range: ${minPort}-${maxPort}`);
  }

  const tried = new Set<number>();
  while (tried.size < rangeSize) {
    const port = minPort + Math.floor(Math.random() * rangeSize);
    if (tried.has(port)) {
      continue;
    }
    tried.add(port);
    if (await isPortFree(port, host)) {
      cons.info(`Using port ${port}`);
      return port;
    }
    cons.warning(`Port ${port} is not available, trying another port...`);
  }

  // if you see this... you need to uninstall that shady bitcoin miner.
  throw new Error(`No free port available in range ${minPort}-${maxPort}`);
}

export function isPortFree(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}
