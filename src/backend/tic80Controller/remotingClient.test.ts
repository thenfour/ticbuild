import net from "node:net";
import * as cons from "../../utils/console";
import { Tic80RemotingClient } from "./remotingClient";

function listen(server: net.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Server did not bind to an IPv4 port"));
        return;
      }
      resolve(address.port);
    });
  });
}

function closeServer(server: net.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

describe("Tic80RemotingClient", () => {
  it("dispatches pushed events without consuming the matching command response", async () => {
    const server = net.createServer((socket) => {
      socket.once("data", (chunk) => {
        const line = chunk.toString("utf8").trim();
        const id = Number(line.split(/\s+/, 1)[0]);
        socket.write('-1 trace "hello from tic80"\n');
        socket.write(`${id} OK "TIC-80 remoting v1"\n`);
      });
    });
    const port = await listen(server);
    const client = new Tic80RemotingClient("127.0.0.1", port, false);
    const warnings = jest.spyOn(cons, "warning").mockImplementation(() => undefined);
    const events: Array<{ id: number; eventType: string; data: string }> = [];
    client.onEvent((event) => events.push(event));

    try {
      await client.connect();
      await expect(client.hello()).resolves.toBe('"TIC-80 remoting v1"');
      expect(events).toEqual([{ id: -1, eventType: "trace", data: '"hello from tic80"' }]);
      expect(warnings).not.toHaveBeenCalledWith(expect.stringContaining("No pending request"));
    } finally {
      warnings.mockRestore();
      client.close();
      await closeServer(server);
    }
  });
});
