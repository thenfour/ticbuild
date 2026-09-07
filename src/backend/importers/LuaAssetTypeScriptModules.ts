import * as luaparse from "luaparse";
import * as path from "node:path";
import { ensureDir, fileExists, readTextFileAsync, writeTextFile } from "../../utils/fileSystem";
import { collectDocCommentAbove, LuaCATSInfo, LuaCATSParam, parseLuaCatsParameterName, parseLuaDocLines } from "../../utils/lua/LuaCATS";
import { collectLuaCatsNamedTypes } from "../../utils/lua/LuaCATS_declarations";
import { parseLua } from "../../utils/lua/lua_processor";
import { LUA_RESERVED_WORDS } from "../../utils/lua/lua_utils";
import { profileAsync, TraceScope } from "../../utils/traceProfiler";
import { GeneratedLuaSource, ResourceManager } from "../ImportedResourceTypes";
import { LuaImportSourceResolver, LuaPreprocessResult, preprocessLuaCode } from "../luaPreprocessor";
import { kImportKind } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { createIdentitySourceMap, mapPreprocessedOffset, mapPreprocessedOffsetToLineColumn } from "../sourceMap";
import { LuaCodeResource } from "./LuaCodeImporter";
import { LuaNamedType, LuaTypeCatalog } from "./LuaTypeCatalog";
import { isTypeScriptIdentifier, renderTypeScriptTypeParameters } from "./TypeScriptDeclarationSyntax";
import {
  createManifestCodeModuleCatalog,
  ManifestCodeModuleDefinition
} from "./ManifestCodeTypeScriptModules";


const TYPESCRIPT_RESERVED_WORDS = new Set([
  "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete",
  "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements",
  "import", "in", "instanceof", "interface", "let", "new", "null", "package", "private", "protected",
  "public", "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var",
  "void", "while", "with", "yield",
]);

export type LuaAssetModuleDefinition = ManifestCodeModuleDefinition & { kind: "LuaCode" };

type LuaFunctionParameter = {
  name: string;
  isRest: boolean;
};

type LuaGlobalDeclaration = {
  name: string;
  kind: "function" | "value";
  parameters?: LuaFunctionParameter[];
  valueType?: string;
  doc?: LuaCATSInfo;
  sourceFile?: string;
};

// Returns the generated declaration file used by ticbuild and conventional TypeScript tooling.
export function getLuaAssetDeclarationsPath(projectDir: string): string {
  return path.join(projectDir, ".ticbuild", "declarations", "lua-assets.d.ts");
}

export function createLuaAssetModuleCatalog(project: TicbuildProjectCore): ReadonlyMap<string, LuaAssetModuleDefinition> {
  return new Map(
    Array.from(createManifestCodeModuleCatalog(project))
      .filter((entry): entry is [string, LuaAssetModuleDefinition] => entry[1].kind === kImportKind.key.LuaCode),
  );
}

export type LuaAssetDeclarations = {
  definition: LuaAssetModuleDefinition;
  declarations: LuaGlobalDeclaration[];
  types: LuaNamedType[];
  codeImports: Set<string>;
  dependencies: string[];
};

/** Collect source declarations without asking a TypeScript resource to generate Lua. */
export async function collectLuaAssetDeclarations(
  project: TicbuildProjectCore,
  resources: ResourceManager,
  definition: LuaAssetModuleDefinition,
  parentScope?: TraceScope,
  resolveImportSource?: LuaImportSourceResolver,
): Promise<LuaAssetDeclarations> {
  const resource = await resources.loadResource(definition.importName);
  if (!(resource instanceof LuaCodeResource)) {
    throw new Error(`Cannot generate TypeScript declarations for missing LuaCode asset '${definition.importName}'`);
  }
  const codeImports = new Set<string>();
  const generated = await resource.getGeneratedLuaSource(project);
  const preprocess = await profileAsync(parentScope, "Lua asset declaration preprocessing", {
    category: "TypeScript declarations", args: { importName: definition.importName },
  }, scope => preprocessLuaCode(project, generated.source, generated.sourcePath, {
    sourceMap: generated.sourceMap,
    resolveImportSource,
    resolveCodeImport: async importName => {
      codeImports.add(importName);
      return resolveDeclarationInclude(project, resources, importName);
    },
    profileScope: scope,
  }));
  return {
    definition, declarations: extractLuaGlobalDeclarations(preprocess), types: collectLuaNamedTypes(preprocess),
    codeImports, dependencies: preprocess.dependencies
  };
}

/** Attach authored locations after the LuaCATS parser has collected declaration blocks. */
function collectLuaNamedTypes(preprocess: LuaPreprocessResult): LuaNamedType[] {
  return collectLuaCatsNamedTypes(preprocess.code).map(({ declaration, offset }) => {
    const origin = mapPreprocessedOffsetToLineColumn(preprocess.sourceMap, offset, "right");
    const source = origin ? `${origin.file}:${origin.line}:${origin.column}` : `Lua:${offset}`;
    return { ...declaration, source };
  });
}

export async function writeLuaAssetTypeScriptDeclarations(projectDir: string, content: string): Promise<void> {
  const declarationPath = getLuaAssetDeclarationsPath(projectDir);
  if (fileExists(declarationPath) && await readTextFileAsync(declarationPath, "utf-8") === content) return;
  ensureDir(path.dirname(declarationPath));
  await writeTextFile(declarationPath, content, "utf-8");
}

export async function resolveDeclarationInclude(
  project: TicbuildProjectCore,
  resources: ResourceManager,
  importName: string,
): Promise<GeneratedLuaSource | undefined> {
  const importDef = project.manifest.imports.find(candidate => candidate.name === importName);
  if (importDef?.kind === kImportKind.key.TypeScriptCode) {
    return { source: "", sourcePath: `import:${importName}`, sourceMap: createIdentitySourceMap("", `import:${importName}`) };
  }
  return resources.getGeneratedLuaSource(project, importName);
}

function extractLuaGlobalDeclarations(preprocess: LuaPreprocessResult): LuaGlobalDeclaration[] {
  const ast = parseLua(preprocess.code);
  if (!ast) {
    throw new Error("Cannot generate TypeScript declarations because a Lua asset could not be parsed");
  }

  const declarations = new Map<string, LuaGlobalDeclaration>();
  const scopeStack: Array<Set<string>> = [new Set<string>()];
  const sourceLines = preprocess.code.split(/\r?\n/); // split lines
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
  const getDoc = (node: luaparse.Node): LuaCATSInfo | undefined => {
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

export function renderLuaAssetDeclarations(
  modules: readonly LuaAssetDeclarations[],
  catalog: LuaTypeCatalog,
): string {
  const lines = [
    "// Generated by ticbuild. Changes will be overwritten.",
    "/** @noSelfInFile */",
    "",
  ];
  for (const module of modules) {
    lines.push(`declare module ${JSON.stringify(module.definition.moduleSpecifier)} {`);
    lines.push(...catalog.renderModuleTypes(module.definition.moduleSpecifier).map(line => `  ${line}`));
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
      lines.push(...renderLuaGlobalDeclaration(declaration, bindingName, catalog).map((line) => `  ${line}`));
    }
    lines.push("}", "");
  }
  return `${lines.join("\n")}\n`;
}

function renderLuaGlobalDeclaration(declaration: LuaGlobalDeclaration, bindingName: string, catalog: LuaTypeCatalog): string[] {
  const generics = declaration.doc?.generics ?? [];
  const renderType = (type: string | undefined) => catalog.render(type, `${declaration.sourceFile ?? "Lua"} (${declaration.name})`, generics);
  const lines: string[] = [];
  const docLines = renderTypeScriptDoc(declaration);
  lines.push(...docLines);
  if (declaration.kind === "value" || declaration.doc?.type) {
    const exportPrefix = bindingName === declaration.name ? "export " : "";
    lines.push(`${exportPrefix}const ${bindingName}: ${declaration.doc?.type ? renderType(declaration.doc.type) : declaration.valueType ?? "any"};`);
    if (bindingName !== declaration.name) {
      lines.push(`export { ${bindingName} as ${declaration.name} };`);
    }
    return lines;
  }

  const parameters = resolveFunctionParameters(declaration, renderType);
  const returnType = renderType(declaration.doc?.returnType);
  const exportPrefix = bindingName === declaration.name ? "export " : "";
  const typeParameters = renderTypeScriptTypeParameters(generics);
  lines.push(`${exportPrefix}function ${bindingName}${typeParameters}(${renderFunctionParameters(parameters)}): ${returnType};`);
  if (bindingName !== declaration.name) {
    lines.push(`export { ${bindingName} as ${declaration.name} };`);
  }
  return lines;
}

type ResolvedFunctionParameter = { name: string; type: string; optional: boolean; isRest: boolean };

function resolveFunctionParameters(
  declaration: LuaGlobalDeclaration,
  renderType: (type: string | undefined) => string,
): ResolvedFunctionParameter[] {
  const usedNames = new Set<string>();
  return (declaration.parameters ?? []).map((parameter, index) => {
    const doc = findParameterDoc(declaration.doc?.params ?? [], parameter.name, index);
    let name = isTypeScriptParameterName(parameter.name) ? parameter.name : `arg${index + 1}`;
    while (usedNames.has(name)) name = `${name}_${index + 1}`;
    usedNames.add(name);
    return {
      name, type: renderType(doc?.type), isRest: parameter.isRest,
      optional: doc ? parseLuaCatsParameterName(doc.name).optional : false,
    };
  });
}

// Match annotations by authored name first; positional matching also supports
// annotations on macro parameters whose generated names differ.
function findParameterDoc(docs: readonly LuaCATSParam[], name: string, index: number): LuaCATSParam | undefined {
  return docs.find(doc => parseLuaCatsParameterName(doc.name).name === name) ?? docs[index];
}

/**
 * A trailing optional parameter renders as "value?: Vec2". If a required parameter
 * follows it, TypeScript requires "value: (Vec2) | undefined, count: number".
 * Lua varargs render as "...args: (Vec2)[]".
 */
function renderFunctionParameters(parameters: readonly ResolvedFunctionParameter[]): string {
  return parameters.map((parameter, index) => {
    const { name, type, optional } = parameter;
    if (parameter.isRest) return `...${name}: (${type})[]`;
    const requiredAfter = parameters.slice(index + 1).some(next => !next.isRest && !next.optional);
    if (optional && requiredAfter) return `${name}: (${type}) | undefined`;
    return `${name}${optional ? "?" : ""}: ${type}`;
  }).join(", ");
}

function renderTypeScriptDoc(declaration: LuaGlobalDeclaration): string[] {
  const description = declaration.doc?.description;
  const source = declaration.sourceFile ? `Lua source: ${declaration.sourceFile}` : undefined;
  if (!description && !source) {
    return [];
  }
  // Neutralize comment terminators in authored prose before embedding it in JSDoc.
  const content = [description, source].filter((value): value is string => !!value)
    .flatMap((value) => value.split(/\r?\n/))
    .map((line) => line.replace(/\*\//g, "* /"));
  return ["/**", ...content.map((line) => ` * ${line}`), " */"];
}

function isTypeScriptExportName(name: string): boolean {
  return isTypeScriptIdentifier(name) && !TYPESCRIPT_RESERVED_WORDS.has(name);
}

// returns true if the given name is a valid typescript param name.
// shouldn't be a Lua reserved word for clarity.
function isTypeScriptParameterName(name: string): boolean {
  return isTypeScriptExportName(name) && !LUA_RESERVED_WORDS.has(name);
}

// helper because of weird typing; just returns node.range or undefined.
function nodeRange(node: luaparse.Node | null | undefined): [number, number] | undefined {
  const range = (node as { range?: [number, number] } | null | undefined)?.range;
  return Array.isArray(range) && range.length >= 2 ? range : undefined;
}
