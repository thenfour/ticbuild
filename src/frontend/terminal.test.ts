import { parseHostPort } from "./terminal";

describe("terminal host:port parsing", () => {
    it("parses valid host:port", () => {
        expect(parseHostPort("127.0.0.1:55000")).toEqual({ host: "127.0.0.1", port: 55000 });
    });

    it("throws for missing separator", () => {
        expect(() => parseHostPort("127.0.0.1")).toThrow("Invalid host:port");
    });

    it("throws for invalid port", () => {
        expect(() => parseHostPort("127.0.0.1:nope")).toThrow("Invalid port");
    });
});
