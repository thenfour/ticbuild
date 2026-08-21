import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

export type TicbuildTypeScriptOutputContract = {
  entryFilePath: string;
  bundleFileName: string;
};

export function createTypeScriptTranspilationOptions(
  configuredOptions: tstl.CompilerOptions,
  output: TicbuildTypeScriptOutputContract,
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
    luaLibImport: tstl.LuaLibImportKind.RequireMinimal,
    luaBundle: output.bundleFileName,
    luaBundleEntry: output.entryFilePath,
    sourceMap: false,
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
