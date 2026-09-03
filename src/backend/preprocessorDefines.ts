import { PreprocessorValue } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

export function getResolvedPreprocessorDefines(
  project: TicbuildProjectCore,
): Readonly<Record<string, PreprocessorValue>> {
  const defines = project.manifest.preprocessor?.defines;
  if (!defines) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(defines).map(([name, value]) => [
      name,
      typeof value === "string" ? project.substituteVariables(value) : value,
    ]),
  );
}
