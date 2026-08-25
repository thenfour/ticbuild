export type LuaLineBehavior = "pretty" | "tight" | "tight2" | "single-line-blocks" | "traceable";

export type LuaPrinterOptions = {
  maxIndentLevel: number;
  // pretty preserves newlines; tight packs statement fragments; tight2 removes all
  // lexically optional whitespace; single-line-blocks packs only whole blocks.
  // traceable isolates diagnostic anchors for Lua's line-only runtime errors.
  lineBehavior: LuaLineBehavior;
  maxLineLength: number;
};
