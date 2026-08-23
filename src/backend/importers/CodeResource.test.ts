import { GeneratedLuaSource, ImportedResourceBase, ResourceManager } from "../ImportedResourceTypes";
import { Manifest } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { createIdentitySourceMap } from "../sourceMap";
import { CodeResource } from "./CodeResource";
import { LuaCodeResource } from "./LuaCodeImporter";

class FakeTranspiledCodeResource extends CodeResource {
  private readonly generatedLua: string;
  private readonly sourceDependencies: string[];

  constructor(filePath: string, sourceText: string, generatedLua: string, sourceDependencies?: string[]) {
    super(filePath, sourceText);
    this.generatedLua = generatedLua;
    this.sourceDependencies = sourceDependencies ?? [filePath];
  }

  protected async generateLuaSource(): Promise<GeneratedLuaSource> {
    return {
      source: this.generatedLua,
      sourcePath: this.filePath,
      sourceMap: createIdentitySourceMap(this.generatedLua, this.filePath),
      dependencies: this.sourceDependencies.map((dependencyPath) => ({
        path: dependencyPath,
        reason: "Fake source-language input",
      })),
    };
  }

  protected getInputDependencyReason(): string {
    return "Fake source-language input";
  }
}

function makeProject(): TicbuildProjectCore {
  const manifest: Manifest = {
    project: {
      name: "test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "test.tic",
    },
    imports: [
      { name: "main", path: "main.lua", kind: "LuaCode" },
      { name: "typed", path: "typed.ts", kind: "TypeScriptCode" },
    ],
    assembly: { blocks: [] },
  };
  return new TicbuildProjectCore({
    manifest,
    manifestPath: "C:/test/manifest.ticbuild.jsonc",
    projectDir: "C:/test",
  });
}

describe("CodeResource Lua pipeline", () => {
  it("preprocesses generated Lua from a language-neutral import include", async () => {
    const project = makeProject();
    const main = new LuaCodeResource(
      "C:/test/main.lua",
      '--#include "import:typed" with { FEATURE = true }\nprint("main")',
    );
    const typed = new FakeTranspiledCodeResource(
      "C:/test/typed.ts",
      "export function typedCode(): void {}",
      [
        "--#ifdef FEATURE",
        "--#minify allow_rename",
        "function TypedCode()",
        '  print("typed")',
        "end",
        "--#endif",
      ].join("\n"),
      ["C:/test/typed.ts", "C:/test/typed-helper.ts"],
    );
    const items = new Map<string, ImportedResourceBase>();
    items.set("main", main);
    items.set("typed", typed);
    const resources = new ResourceManager(items);

    await main.initialize(project, (importName) => resources.getGeneratedLuaSource(project, importName));

    const preprocess = main.getPreprocessResult();
    expect(preprocess.code).toContain("function TypedCode()");
    expect(preprocess.code).toContain('print("main")');
    expect(preprocess.minifyAllowedGlobalNames).toContain("TypedCode");
    expect(main.getDependencyList().map((dependency) => dependency.path)).toEqual([
      "C:/test/main.lua",
      "C:/test/typed.ts",
      "C:/test/typed-helper.ts",
    ]);
  });

  it("lets generated Lua include a Lua code asset through the same resolver", async () => {
    const project = makeProject();
    const main = new LuaCodeResource("C:/test/main.lua", 'print("lua helper")');
    const typed = new FakeTranspiledCodeResource(
      "C:/test/typed.ts",
      "export function typedCode(): void {}",
      '--#include "import:main"\nprint("typed")',
    );
    const items = new Map<string, ImportedResourceBase>();
    items.set("main", main);
    items.set("typed", typed);
    const resources = new ResourceManager(items);

    await typed.initialize(project, (importName) => resources.getGeneratedLuaSource(project, importName));

    expect(typed.getPreprocessResult().code).toContain('print("lua helper")');
    expect(typed.getDependencyList().map((dependency) => dependency.path)).toEqual([
      "C:/test/typed.ts",
      "C:/test/main.lua",
    ]);
  });

  it("detects cycles across code-resource languages", async () => {
    const project = makeProject();
    const main = new LuaCodeResource("C:/test/main.lua", '--#include "import:typed"');
    const typed = new FakeTranspiledCodeResource(
      "C:/test/typed.ts",
      "export function typedCode(): void {}",
      '--#include "import:main"',
    );
    const items = new Map<string, ImportedResourceBase>();
    items.set("main", main);
    items.set("typed", typed);
    const resources = new ResourceManager(items);

    await expect(
      main.initialize(project, (importName) => resources.getGeneratedLuaSource(project, importName)),
    ).rejects.toThrow("Lua preprocessor include cycle detected");
  });
});
