import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

export function createTypeScriptTranspilationOptions(
  configuredOptions: tstl.CompilerOptions,
): tstl.CompilerOptions {
  return {
    target: ts.ScriptTarget.ESNext,
    lib: ["lib.esnext.d.ts"],
    moduleResolution: ts.ModuleResolutionKind.Node10,
    strict: true,
    skipLibCheck: true,
    ...configuredOptions,
    // Top-level TypeScript functions become ordinary Lua functions. Object and
    // class methods still retain their normal self parameter.
    noImplicitSelf: true,
    noEmit: false,
    noEmitOnError: false,
    emitDeclarationOnly: false,
    noHeader: true,
    luaTarget: tstl.LuaTarget.Lua53,
    // The ticbuild static linker removes runtime module loading (requires/____exports/et al).
    // Inline helpers keep Lua library support self-contained until linker-level deduplication
    // is implemented.
    luaLibImport: tstl.LuaLibImportKind.Inline,
    luaBundle: undefined,
    luaBundleEntry: undefined,
    // use export to define globals
    // TIC-80 callbacks (TIC et al) are promoted separately by the static linker.
    noImplicitGlobalVariables: true,
    // ticbuild uses this to map Lua stack traces back to TypeScript source code.
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: false,
    declaration: false,
    declarationMap: false,
    outFile: undefined,
    outDir: undefined,
    declarationDir: undefined,
    incremental: false,
    composite: false,
    tsBuildInfoFile: undefined,
    buildMode: tstl.BuildMode.Default,
    sourceMapTraceback: false,
    luaPlugins: [],
    noResolvePaths: undefined,
  };
}
