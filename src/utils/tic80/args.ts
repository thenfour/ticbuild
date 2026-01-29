function getOptionKey(arg: string): string | undefined {
  // Extracts the option key from an argument string (--fs=c:\temp -> --fs)
  if (arg.startsWith("--")) {
    const eqIndex = arg.indexOf("=");
    return eqIndex === -1 ? arg : arg.substring(0, eqIndex);
  }
  if (arg.startsWith("-") && arg.length > 1) {
    return arg.substring(0, 2);
  }
  return undefined;
}

export function mergeTic80Args(defaultArgs: string[], userArgs: string[] = []): string[] {
  if (userArgs.length === 0) {
    return [...defaultArgs];
  }
  const userKeys = new Set<string>();
  for (const arg of userArgs) {
    const key = getOptionKey(arg);
    if (key) {
      userKeys.add(key);
    }
  }

  const filteredDefaults = defaultArgs.filter((arg) => {
    const key = getOptionKey(arg);
    return key ? !userKeys.has(key) : true;
  });

  return [...filteredDefaults, ...userArgs];
}

// Finds the value for a specific option key in the argument list
// e.g., for args ["--fs=c:\temp", "-p", "8080"], findOptionValue(args, "--fs") returns "c:\temp"
// required because if the user overrides the --remoting-port, we need to pick that up so we listen
// on the correct port.
export function findOptionValue(args: string[], optionKey: string): string | undefined {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === optionKey) {
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        return next;
      }
      return undefined;
    }
    if (arg.startsWith(optionKey + "=")) {
      return arg.substring(optionKey.length + 1);
    }
  }
  return undefined;
}
