import type { LuaOptimizationRule } from "./lua_optimizer_types";

export const stripCommentsRule: LuaOptimizationRule = {
  id: "syntax.strip-comments",
  family: "syntax",
  description: "Remove comments from the parsed program",
  defaultEnabled: (options) => options.stripComments,
  hooks: {
    normalize(context) {
      context.ast.comments = [];
    },
  },
};
