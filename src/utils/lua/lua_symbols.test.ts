import { generateLuaSymbolName, LuaSymbolAllocator } from "./lua_symbols";

describe("Lua symbol generation", () => {
  it("uses one canonical short-name sequence with optional prefixes", () => {
    expect([0, 25, 26, 27, 51, 52].map(index => generateLuaSymbolName(index))).toEqual([
      "a",
      "z",
      "aa",
      "ab",
      "az",
      "ba",
    ]);
    expect(generateLuaSymbolName(27, "_")).toBe("_ab");
    expect(generateLuaSymbolName(27, "L")).toBe("Lab");
  });

  it("rejects invalid indexes", () => {
    expect(() => generateLuaSymbolName(-1)).toThrow(RangeError);
    expect(() => generateLuaSymbolName(1.5)).toThrow(RangeError);
  });
});

describe("Lua symbol allocation", () => {
  it("skips reserved, unavailable, and already allocated names", () => {
    const reservedNames = new Set(Array.from({ length: 118 }, (_, index) => generateLuaSymbolName(index)));
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
});
