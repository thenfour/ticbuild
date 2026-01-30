export const kNullKey = "__NULL__";

export function TryParseInt(value: any): number | null {
  if (typeof value === "number" && isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
}

export const formatBytes = (n: number | null) => {
  if (n == null) return "...";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

// Remove the extension from a filename string.
// example: "myfile.txt" => "myfile"
export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, "");
}

export type TObject = { [key: string]: any };
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Generic deep merge that treats arrays as leaf values
export function deepMergeObjects(target: TObject, source: TObject): void {
  for (const key in source) {
    if (!source.hasOwnProperty(key)) {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = target[key];

    // Arrays are treated as leaf values - replace entirely
    if (Array.isArray(sourceValue)) {
      target[key] = sourceValue;
    }
    // Objects are merged recursively
    else if (sourceValue !== null && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
      if (!targetValue || typeof targetValue !== "object") {
        target[key] = {};
      }
      deepMergeObjects(target[key], sourceValue);
    }
    // Primitives override
    else {
      target[key] = sourceValue;
    }
  }
}

// Extracts variables from non-array leaf values in an object
function extractVariablesFromObject2(obj: TObject, prefix: string | undefined): Map<string, string> {
  const variables = new Map<string, string>();
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Arrays are leaf values, don't process them
    if (Array.isArray(value)) {
      continue;
    }
    // Objects are processed recursively
    else if (value !== null && typeof value === "object") {
      const childVars = extractVariablesFromObject2(value, fullKey);
      for (const [k, v] of childVars.entries()) {
        variables.set(k, v);
      }
    }
    // Primitives become variables
    else if (value !== undefined && value !== null) {
      variables.set(fullKey, String(value));
    }
  }
  return variables;
}

// Extracts variables from non-array leaf values in an object
export function extractVariablesFromObject(obj: TObject): Map<string, string> {
  return extractVariablesFromObject2(obj, undefined);
}

// where K and V are serializable types
export function makeMapSerializable<K, V>(map: Map<K, V>): object {
  return Object.fromEntries(map.entries());
}
export function deserializeMap<K, V>(obj: object): Map<K, V> {
  return new Map<K, V>(Object.entries(obj) as [K, V][]);
}

export function CoalesceBool(value: boolean | null | undefined, defaultValue: boolean): boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
}


export function trimTrailingZeros(data: Uint8Array): Uint8Array {
  let end = data.length;
  while (end > 0 && data[end - 1] === 0) {
    end -= 1;
  }
  return data.slice(0, end);
}
