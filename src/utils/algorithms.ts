// debounce delays execution of fn until after waitMs have elapsed since the
// last call.
type Fn = (...args: unknown[]) => unknown;
export function debounce<T extends Fn>(func: T, waitMs: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}
