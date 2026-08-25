import { generateLuaSymbolName, LuaSymbolAllocator } from "./lua_symbols";

describe("Lua symbol generation", () => {
  it("uses every legal first character before generating two-character names", () => {
    expect([0, 25, 26, 51, 52, 53, 54].map(index => generateLuaSymbolName(index))).toEqual([
      "a",
      "z",
      "A",
      "Z",
      "_",
      "aa",
      "ab",
    ]);
  });

  it("uses digits and underscore in continuation positions", () => {
    expect([105, 114, 115, 116, 3391, 3392].map(index => generateLuaSymbolName(index))).toEqual([
      "a0",
      "a9",
      "a_",
      "ba",
      "__",
      "aaa",
    ]);
  });

  it("uses the continuation alphabet immediately after a prefix", () => {
    expect([0, 25, 26, 51, 52, 61, 62, 63].map(index => generateLuaSymbolName(index, "_"))).toEqual([
      "_a",
      "_z",
      "_A",
      "_Z",
      "_0",
      "_9",
      "__",
      "_aa",
    ]);
    expect(generateLuaSymbolName(52, "L")).toBe("L0");
  });

  it("generates unique valid Lua identifiers across charset boundaries", () => {
    const names = Array.from({ length: 5000 }, (_, index) => generateLuaSymbolName(index));
    expect(new Set(names).size).toBe(names.length);
    expect(names.every(name => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name))).toBe(true);
  });

  it("rejects invalid indexes", () => {
    expect(() => generateLuaSymbolName(-1)).toThrow(RangeError);
    expect(() => generateLuaSymbolName(1.5)).toThrow(RangeError);
  });
});

describe("Lua symbol allocation", () => {
  it("skips reserved, unavailable, and already allocated names", () => {
    const reservedNames = new Set(Array.from({ length: 256 }, (_, index) => generateLuaSymbolName(index)));
    const allocator = new LuaSymbolAllocator({ reservedNames });

    expect(allocator.peek()).toBe("dp");
    expect(allocator.peek()).toBe("dp");
    expect(allocator.allocate()).toBe("dp");
    expect(allocator.allocate()).toBe("dq");
  });

  it("shares collision reservations between allocators", () => {
    const reservedNames = new Set<string>();
    const first = new LuaSymbolAllocator({ reservedNames });
    const second = new LuaSymbolAllocator({ reservedNames });

    expect(first.allocate()).toBe("a");
    expect(second.allocate()).toBe("b");
  });

  it("forks inherited reservations without sharing child allocations", () => {
    const root = new LuaSymbolAllocator();
    expect(root.allocate()).toBe("a");

    const firstChild = root.fork();
    const secondChild = root.fork();
    expect(firstChild.allocate()).toBe("b");
    expect(firstChild.allocate()).toBe("c");
    expect(secondChild.allocate()).toBe("b");
  });
});
