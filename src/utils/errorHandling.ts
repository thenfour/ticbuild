////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// error handling / assert / result stuff
export type Ok<T> = {
  ok: true;
  value: T;
};
export type Err = {
  ok: false;
  error: string;
};
export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

export function assert(condition: boolean = true, message: string = "Assertion failed"): asserts condition {
  if (!condition) {
    console.error("Assertion failed:", message);
    throw new Error(message);
  }
}
