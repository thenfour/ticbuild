// The ASCII identifier subset emitted by ticbuild: Vec2, _value, $result.
// Keyword restrictions depend on the declaration position and are checked by callers.
const typeScriptIdentifierPattern = /^[A-Za-z_$][\w$]*$/;

export function isTypeScriptIdentifier(name: string): boolean {
  return typeScriptIdentifierPattern.test(name);
}

/** ("ticbuild-assets/math", "Vec2") -> import("ticbuild-assets/math").Vec2. */
export function renderTypeScriptImportType(moduleName: string, name?: string): string {
  const module = `import(${JSON.stringify(moduleName)})`;
  return name ? `${module}.${name}` : module;
}

/** ["T", "U"] -> "<T, U>"; an empty list emits no brackets. */
export function renderTypeScriptTypeParameters(parameters: readonly string[]): string {
  return parameters.length ? `<${parameters.join(", ")}>` : "";
}

/** Reserve a spelling by appending underscores until it avoids existing bindings. */
export function findAvailableTypeScriptBinding(preferred: string, used: ReadonlySet<string>): string {
  let binding = preferred;
  while (used.has(binding)) binding += "_";
  return binding;
}
