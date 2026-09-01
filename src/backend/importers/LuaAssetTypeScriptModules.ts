import * as path from "node:path";
import * as luaparse from "luaparse";
import { ensureDir, fileExists, readTextFileAsync, writeTextFile } from "../../utils/fileSystem";
import { collectDocCommentAbove, LuaDocInfo, parseLuaDocLines } from "../../utils/lua/lua_doc";
import { parseLua } from "../../utils/lua/lua_processor";
import { GeneratedLuaSource, ResourceManager } from "../ImportedResourceTypes";
import { preprocessLuaCode, LuaPreprocessResult } from "../luaPreprocessor";
import { kImportKind } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { createIdentitySourceMap, mapPreprocessedOffset } from "../sourceMap";
import { LuaCodeResource } from "./LuaCodeImporter";
import { LUA_RESERVED_WORDS } from "../../utils/lua/lua_utils";

export const LUA_ASSET_MODULE_PREFIX = "ticbuild-assets/";

export type LuaAssetModuleDefinition = {
  importName: string;
  moduleSpecifier: string;
};

type LuaFunctionParameter = {
  name: string;
  isRest: boolean;
};

type LuaGlobalDeclaration = {
  name: string;
  kind: "function" | "value";
  parameters?: LuaFunctionParameter[];
  valueType?: string;
  doc?: LuaDocInfo;
  sourceFile?: string;
};

// Returns the generated declaration file used by ticbuild and conventional TypeScript tooling.
export function getLuaAssetDeclarationsPath(projectDir: string): string {
  return path.join(projectDir, ".ticbuild", "declarations", "lua-assets.d.ts");
}

// Parses a Lua asset module name, without accepting lookalike package paths.
export function parseLuaAssetModuleSpecifier(specifier: string): string | undefined {
  if (!specifier.startsWith(LUA_ASSET_MODULE_PREFIX)) {
    return undefined;
  }
  const importName = specifier.slice(LUA_ASSET_MODULE_PREFIX.length);
  // Accept only simple identifiers, not paths or package-like names.
  return importName.length > 0 && !/[/:]/.test(importName) ? importName : undefined;
}

// builds the manifest-backed module catalog consumed by the static linker
export function createLuaAssetModuleCatalog(project: TicbuildProjectCore): ReadonlyMap<string, LuaAssetModuleDefinition> {
  const result = new Map<string, LuaAssetModuleDefinition>();
  for (const importDef of project.manifest.imports) {
    if (importDef.kind !== kImportKind.key.LuaCode) {
      continue;
    }
    result.set(importDef.name, {
      importName: importDef.name,
      moduleSpecifier: `${LUA_ASSET_MODULE_PREFIX}${importDef.name}`,
    });
  }
  return result;
}

// generates .d.ts file for all LuaCode assets in the manifest, so TypeScript can see them
// this is done after all raw resources are loaded, but before any code resource is processed
// respects Lua includes, but TypeScript includes are omitted to avoid a
// circular Lua -> TypeScript -> declaration bootstrap.
export async function prepareLuaAssetTypeScriptDeclarations(
  project: TicbuildProjectCore,
  resources: ResourceManager,
): Promise<void> {
  const hasTypeScript = project.manifest.imports.some(
    (importDef) => importDef.kind === kImportKind.key.TypeScriptCode,
  );
  if (!hasTypeScript) {
    return;
  }

  const modules: Array<{ definition: LuaAssetModuleDefinition; declarations: LuaGlobalDeclaration[] }> = [];
  for (const definition of createLuaAssetModuleCatalog(project).values()) {
    const resource = resources.items.get(definition.importName);
    if (!(resource instanceof LuaCodeResource)) {
      throw new Error(`Cannot generate TypeScript declarations for missing LuaCode asset '${definition.importName}'`);
    }
    const generated = await resource.getGeneratedLuaSource(project);
    const preprocess = await preprocessLuaCode(project, generated.source, generated.sourcePath, {
      sourceMap: generated.sourceMap,
      resolveCodeImport: async (importName) => resolveDeclarationInclude(project, resources, importName),
    });
    modules.push({ definition, declarations: extractLuaGlobalDeclarations(preprocess) });
  }

  const declarationPath = getLuaAssetDeclarationsPath(project.projectDir);
  const content = renderLuaAssetDeclarations(modules);
  if (fileExists(declarationPath) && await readTextFileAsync(declarationPath, "utf-8") === content) {
    return;
  }
  ensureDir(path.dirname(declarationPath));
  await writeTextFile(declarationPath, content, "utf-8");
}

async function resolveDeclarationInclude(
  project: TicbuildProjectCore,
  resources: ResourceManager,
  importName: string,
): Promise<GeneratedLuaSource | undefined> {
  const importDef = project.manifest.imports.find((candidate) => candidate.name === importName);
  if (importDef?.kind === kImportKind.key.TypeScriptCode) {
    return {
      source: "",
      sourcePath: `import:${importName}`,
      sourceMap: createIdentitySourceMap("", `import:${importName}`),
    };
  }
  const resource = resources.items.get(importName);
  return resource instanceof LuaCodeResource
    ? resource.getGeneratedLuaSource(project)
    : undefined;
}

function extractLuaGlobalDeclarations(preprocess: LuaPreprocessResult): LuaGlobalDeclaration[] {
  const ast = parseLua(preprocess.code);
  if (!ast) {
    throw new Error("Cannot generate TypeScript declarations because a Lua asset could not be parsed");
  }

  const declarations = new Map<string, LuaGlobalDeclaration>();
  const scopeStack: Array<Set<string>> = [new Set<string>()];
  const sourceLines = preprocess.code.split(/\r?\n/);
  const isLocal = (name: string) => {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      if (scopeStack[i].has(name)) {
        return true;
      }
    }
    return false;
  };
  const withScope = (callback: () => void) => {
    scopeStack.push(new Set<string>());
    callback();
    scopeStack.pop();
  };
  const getDoc = (node: luaparse.Node): LuaDocInfo | undefined => {
    const withLocation = node as luaparse.Node & { loc?: { start: { line: number } }; range?: [number, number] };
    const lines = withLocation.loc
      ? collectDocCommentAbove(sourceLines, withLocation.loc.start.line - 1)
      : undefined;
    return lines ? parseLuaDocLines(lines) ?? undefined : undefined;
  };
  const getSourceFile = (node: luaparse.Node): string | undefined => {
    const range = nodeRange(node);
    return range ? mapPreprocessedOffset(preprocess.sourceMap, range[0])?.file : undefined;
  };
  const makeParameters = (
    parameters: luaparse.FunctionDeclaration["parameters"],
  ): LuaFunctionParameter[] => parameters.map((parameter, index) => parameter.type === "Identifier"
    ? { name: parameter.name, isRest: false }
    : { name: `args${index || ""}`, isRest: true });
  const setDeclaration = (declaration: LuaGlobalDeclaration) => {
    declarations.set(declaration.name, declaration);
  };

  const walkStatements = (statements: luaparse.Statement[]) => {
    for (const statement of statements) {
      walkStatement(statement);
    }
  };
  const walkFunctionBody = (expression: luaparse.FunctionDeclaration) => {
    withScope(() => {
      for (const parameter of expression.parameters) {
        if (parameter.type === "Identifier") {
          scopeStack[scopeStack.length - 1].add(parameter.name);
        }
      }
      walkStatements(expression.body);
    });
  };
  const walkExpression = (expression: luaparse.Expression): void => {
    switch (expression.type) {
      case "FunctionDeclaration":
        walkFunctionBody(expression);
        return;
      case "TableConstructorExpression":
        for (const field of expression.fields) {
          walkExpression(field.value);
          if (field.type === "TableKey") {
            walkExpression(field.key);
          }
        }
        return;
      case "BinaryExpression":
      case "LogicalExpression":
        walkExpression(expression.left);
        walkExpression(expression.right);
        return;
      case "UnaryExpression":
        walkExpression(expression.argument);
        return;
      case "CallExpression":
        walkExpression(expression.base as luaparse.Expression);
        expression.arguments.forEach(walkExpression);
        return;
      case "TableCallExpression":
        walkExpression(expression.base as luaparse.Expression);
        walkExpression(expression.arguments as luaparse.Expression);
        return;
      case "StringCallExpression":
        walkExpression(expression.base as luaparse.Expression);
        walkExpression(expression.argument as luaparse.Expression);
        return;
      case "MemberExpression":
        walkExpression(expression.base as luaparse.Expression);
        return;
      case "IndexExpression":
        walkExpression(expression.base as luaparse.Expression);
        walkExpression(expression.index);
        return;
      default:
        return;
    }
  };
  const walkStatement = (statement: luaparse.Statement): void => {
    switch (statement.type) {
      case "LocalStatement":
        statement.init.forEach(walkExpression);
        for (const variable of statement.variables) {
          if (variable.type === "Identifier") {
            scopeStack[scopeStack.length - 1].add(variable.name);
          }
        }
        return;
      case "AssignmentStatement":
        statement.init.forEach(walkExpression);
        statement.variables.forEach((variable, index) => {
          if (variable.type !== "Identifier" || isLocal(variable.name)) {
            return;
          }
          const value = statement.init[index];
          const functionValue = value?.type === "FunctionDeclaration" ? value : undefined;
          setDeclaration({
            name: variable.name,
            kind: functionValue ? "function" : "value",
            parameters: functionValue ? makeParameters(functionValue.parameters) : undefined,
            valueType: functionValue ? undefined : inferLuaValueType(value),
            doc: getDoc(statement),
            sourceFile: getSourceFile(variable),
          });
        });
        return;
      case "FunctionDeclaration": {
        const identifier = statement.identifier;
        if (identifier?.type === "Identifier") {
          if (statement.isLocal) {
            scopeStack[scopeStack.length - 1].add(identifier.name);
          } else if (!isLocal(identifier.name)) {
            setDeclaration({
              name: identifier.name,
              kind: "function",
              parameters: makeParameters(statement.parameters),
              doc: getDoc(statement),
              sourceFile: getSourceFile(identifier),
            });
          }
        }
        walkFunctionBody(statement);
        return;
      }
      case "ForNumericStatement":
        walkExpression(statement.start);
        walkExpression(statement.end);
        if (statement.step) {
          walkExpression(statement.step);
        }
        withScope(() => {
          scopeStack[scopeStack.length - 1].add(statement.variable.name);
          walkStatements(statement.body);
        });
        return;
      case "ForGenericStatement":
        statement.iterators.forEach(walkExpression);
        withScope(() => {
          for (const variable of statement.variables) {
            scopeStack[scopeStack.length - 1].add(variable.name);
          }
          walkStatements(statement.body);
        });
        return;
      case "DoStatement":
        withScope(() => walkStatements(statement.body));
        return;
      case "WhileStatement":
        walkExpression(statement.condition);
        withScope(() => walkStatements(statement.body));
        return;
      case "RepeatStatement":
        withScope(() => {
          walkStatements(statement.body);
          walkExpression(statement.condition);
        });
        return;
      case "IfStatement":
        for (const clause of statement.clauses) {
          if (clause.type !== "ElseClause") {
            walkExpression(clause.condition);
          }
          withScope(() => walkStatements(clause.body));
        }
        return;
      case "CallStatement":
        walkExpression(statement.expression);
        return;
      case "ReturnStatement":
        statement.arguments.forEach(walkExpression);
        return;
      default:
        return;
    }
  };

  walkStatements(ast.body);
  return Array.from(declarations.values());
}

function inferLuaValueType(expression: luaparse.Expression | undefined): string {
  switch (expression?.type) {
    case "StringLiteral":
      return "string";
    case "NumericLiteral":
      return "number";
    case "BooleanLiteral":
      return "boolean";
    case "NilLiteral":
      return "undefined";
    default:
      return "any";
  }
}

function renderLuaAssetDeclarations(
  modules: ReadonlyArray<{ definition: LuaAssetModuleDefinition; declarations: LuaGlobalDeclaration[] }>,
): string {
  const lines = [
    "// Generated by ticbuild. Changes will be overwritten.",
    "/** @noSelfInFile */",
    "",
  ];
  for (const module of modules) {
    lines.push(`declare module ${JSON.stringify(module.definition.moduleSpecifier)} {`);
    const usedBindingNames = new Set(module.declarations.map((declaration) => declaration.name));
    for (const [index, declaration] of module.declarations.entries()) {
      let bindingName = declaration.name;
      if (!isTypeScriptExportName(bindingName)) {
        bindingName = `__ticbuild_lua_global_${index + 1}`;
        while (usedBindingNames.has(bindingName)) {
          bindingName += "_";
        }
      }
      usedBindingNames.add(bindingName);
      lines.push(...renderLuaGlobalDeclaration(declaration, bindingName).map((line) => `  ${line}`));
    }
    lines.push("}", "");
  }
  return `${lines.join("\n")}\n`;
}

function renderLuaGlobalDeclaration(declaration: LuaGlobalDeclaration, bindingName: string): string[] {
  const lines: string[] = [];
  const docLines = renderTypeScriptDoc(declaration);
  lines.push(...docLines);
  if (declaration.kind === "value") {
    const exportPrefix = bindingName === declaration.name ? "export " : "";
    lines.push(`${exportPrefix}const ${bindingName}: ${declaration.valueType ?? "any"};`);
    if (bindingName !== declaration.name) {
      lines.push(`export { ${bindingName} as ${declaration.name} };`);
    }
    return lines;
  }

  const usedNames = new Set<string>();
  const parameters = (declaration.parameters ?? []).map((parameter, index) => {
    const docParam = declaration.doc?.params?.find((candidate) => candidate.name === parameter.name)
      ?? declaration.doc?.params?.[index];
    let name = isTypeScriptParameterName(parameter.name) ? parameter.name : `arg${index + 1}`;
    while (usedNames.has(name)) {
      name = `${name}_${index + 1}`;
    }
    usedNames.add(name);
    const type = mapLuaDocTypeToTypescriptType(docParam?.type);
    return parameter.isRest ? `...${name}: ${type}[]` : `${name}: ${type}`;
  });
  const returnType = mapLuaDocTypeToTypescriptType(declaration.doc?.returnType);
  const exportPrefix = bindingName === declaration.name ? "export " : "";
  lines.push(`${exportPrefix}function ${bindingName}(${parameters.join(", ")}): ${returnType};`);
  if (bindingName !== declaration.name) {
    lines.push(`export { ${bindingName} as ${declaration.name} };`);
  }
  return lines;
}

function renderTypeScriptDoc(declaration: LuaGlobalDeclaration): string[] {
  const description = declaration.doc?.description;
  const source = declaration.sourceFile ? `Lua source: ${declaration.sourceFile}` : undefined;
  if (!description && !source) {
    return [];
  }
  const content = [description, source].filter((value): value is string => !!value)
    .flatMap((value) => value.split(/\r?\n/))
    .map((line) => line.replace(/\*\//g, "* /"));
  return ["/**", ...content.map((line) => ` * ${line}`), " */"];
}

// converts luadoc type string to TypeScript type string. Returns "any" for unknown types.
// a convenience so Lua code can describe things in lua language,
// but when it surfaces in TS, it's TS-centric.
function mapLuaDocTypeToTypescriptType(type: string | undefined): string {
  if (!type) {
    return "any";
  }
  const trimmed = type.trim();
  if (trimmed.endsWith("?")) {
    return `${mapLuaDocTypeToTypescriptType(trimmed.slice(0, -1))} | undefined`;
  }
  if (trimmed.includes("|")) {
    return trimmed.split("|").map((part) => mapLuaDocTypeToTypescriptType(part)).join(" | ");
  }
  if (trimmed.endsWith("[]")) {
    return `${mapLuaDocTypeToTypescriptType(trimmed.slice(0, -2))}[]`;
  }
  switch (trimmed.toLowerCase()) {
    case "string":
      return "string";
    case "number":
    case "integer":
    case "float":
      return "number";
    case "boolean":
    case "bool":
      return "boolean";
    case "nil":
      return "undefined";
    case "table":
      return "Record<any, any>";
    case "function":
      return "(...args: any[]) => any";
    case "any":
    case "unknown":
    case "userdata":
    case "thread":
      return "any";
    default:
      return "any";
  }
}

function isTypeScriptExportName(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && !TYPESCRIPT_RESERVED_WORDS.has(name);
}

// returns true if the given name is a valid typescript param name.
// shouldn't be a Lua reserved word for clarity.
function isTypeScriptParameterName(name: string): boolean {
  return isTypeScriptExportName(name) && !LUA_RESERVED_WORDS.has(name);
}

const TYPESCRIPT_RESERVED_WORDS = new Set([
  "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete",
  "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements",
  "import", "in", "instanceof", "interface", "let", "new", "null", "package", "private", "protected",
  "public", "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var",
  "void", "while", "with", "yield",
]);

// helper because of weird typing; just returns node.range or undefined.
function nodeRange(node: luaparse.Node | null | undefined): [number, number] | undefined {
  const range = (node as { range?: [number, number] } | null | undefined)?.range;
  return Array.isArray(range) && range.length >= 2 ? range : undefined;
}
