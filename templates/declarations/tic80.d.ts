/** @noSelfInFile */
/// <reference types="@typescript-to-lua/language-extensions" />

// TIC-80 runtime globals made available to ticbuild TypeScript projects.
// The callback names (TIC, BOOT, BDR, SCN, OVR, MENU) are deliberately not
// declared here so user declarations retain their inferred types.

declare function cls(color?: number): void;
declare function clip(x?: number, y?: number, width?: number, height?: number): void;
declare function pix(x: number, y: number): number;
declare function pix(x: number, y: number, color: number): void;
declare function spr(
  id: number,
  x: number,
  y: number,
  colorkey?: number | number[],
  scale?: number,
  flip?: number,
  rotate?: number,
  width?: number,
  height?: number,
): void;
declare function map(
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  screenX?: number,
  screenY?: number,
  colorkey?: number | number[],
  scale?: number,
  remap?: (...args: any[]) => any,
): void;
declare function line(x0: number, y0: number, x1: number, y1: number, color: number): void;
declare function rect(x: number, y: number, width: number, height: number, color: number): void;
declare function rectb(x: number, y: number, width: number, height: number, color: number): void;
declare function circ(x: number, y: number, radius: number, color: number): void;
declare function circb(x: number, y: number, radius: number, color: number): void;
declare function elli(x: number, y: number, radiusX: number, radiusY: number, color: number): void;
declare function ellib(x: number, y: number, radiusX: number, radiusY: number, color: number): void;
declare function tri(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: number,
): void;
declare function trib(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: number,
): void;
declare function ttri(...args: number[]): void;
declare function print(
  text: string | number,
  x?: number,
  y?: number,
  color?: number,
  fixed?: boolean,
  scale?: number,
  smallfont?: boolean,
): number;
declare function font(
  text: string | number,
  x: number,
  y: number,
  transparentColor: number | number[],
  charWidth?: number,
  charHeight?: number,
  fixed?: boolean,
  scale?: number,
  alternate?: boolean,
): number;
declare function sfx(
  id: number,
  note?: number | string,
  duration?: number,
  channel?: number,
  volume?: number,
  speed?: number,
): void;
declare function music(
  track?: number,
  frame?: number,
  row?: number,
  loop?: boolean,
  sustain?: boolean,
  tempo?: number,
  speed?: number,
): void;
declare function btn(): number;
declare function btn(id: number): boolean;
declare function btnp(id?: number, hold?: number, period?: number): boolean;
declare function key(): boolean;
declare function key(code: number): boolean;
declare function keyp(code?: number, hold?: number, period?: number): boolean;
declare function mouse(): LuaMultiReturn<[
  x: number,
  y: number,
  left: boolean,
  middle: boolean,
  right: boolean,
  scrollX: number,
  scrollY: number,
]>;
declare function memcpy(to: number, from: number, length: number): void;
declare function memset(address: number, value: number, length: number): void;
declare function memcmp(addressA: number, addressB: number, length: number): number;
declare function pmem(index: number): number;
declare function pmem(index: number, value: number): number;
declare function peek(address: number, bits?: number): number;
declare function peek4(address: number): number;
declare function peek2(address: number): number;
declare function peek1(address: number): number;
declare function poke(address: number, value: number, bits?: number): void;
declare function poke4(address: number, value: number): void;
declare function poke2(address: number, value: number): void;
declare function poke1(address: number, value: number): void;
declare function mget(x: number, y: number): number;
declare function mset(x: number, y: number, tileId: number): void;
declare function fget(spriteId: number, flag?: number): number | boolean;
declare function fset(spriteId: number, flag: number, value: boolean): void;
declare function sync(mask?: number, bank?: number, toCart?: boolean): void;
declare function vbank(bank: number): number;
declare function time(): number;
declare function tstamp(): number;
declare function fft(startFrequency: number, endFrequency?: number): number;
declare function ffts(startFrequency: number, endFrequency?: number): number;
declare function trace(message: unknown, color?: number): void;
declare function reset(): void;
declare function exit(): void;

// ticbuild compile-time constants / preprocessor defines access.
// These declarations are interpreted by
// ticbuild's TypeScriptToLua transform and do not provide the actual runtime globals.
declare namespace ticbuild {
  // Scalar literal types supported by ticbuild's constant inliner.
  type ConstantValue = string | number | boolean;

  // @internal Compiler marker used to recognize Constant<T>.
  const __constantBrand: unique symbol;
  // A value expression that ticbuild replaces with the exact literal T during processing
  type Constant<T extends ConstantValue> = T & { readonly [__constantBrand]: T };

  // Presents every scalar property of a generated type map as a compile-time
  // constant value. For example, Vars["project.name"] has the plain string
  // literal type in a type position, while the value expression with the same
  // spelling has type Constant<"MyProject">.
  type ConstantMap<T> = {
    readonly [Name in keyof T]: T[Name] extends ConstantValue ? Constant<T[Name]> : never;
  };

  // Exact values of the active manifest/build-configuration defines
  interface Defines { }
  // Whether Name is present in the active build's Defines map.
  type IsDefined<Name extends string> = Name extends keyof Defines ? true : false;
  // Selects Yes or No according to the presence of Name in Defines.
  type IfDefined<Name extends string, Yes, No> = IsDefined<Name> extends true ? Yes : No;

  // Exact resolved strings in the active project's substitution-variable map.
  // The interface is populated in .ticbuild/declarations/build-constants.d.ts.
  interface Vars { }
  const Vars: ConstantMap<Vars>;

  // Looks up one project variable; these are already fully-resolved/substituted.
  type ProjectVariableValue<Name extends string> =
    Name extends keyof Vars
    ? Vars[Name] extends string
    ? Vars[Name]
    : never
    : never;

  // Resolves one $(...) reference.
  // Project variables are replaced with their actual value;
  // Environment values are excluded from declarations so they just widen to `string`.
  type ExpandedReferenceValue<Name extends string> =
    Name extends `env:${string}`
    ? string
    : ProjectVariableValue<Name>;

  type Expand<Text extends string> =
    Text extends `${infer Before}$(${infer Name})${infer After}`
    ? `${Before}${ExpandedReferenceValue<Name>}${Expand<After>}`
    : Text;

  // Returns a compile-time constant indicating whether the literal Name is defined.
  function IsDefined<Name extends string>(name: string extends Name ? never : Name): Constant<IsDefined<Name>>;
  // Selects one expression at compile time. Only the selected expression is emitted
  // and evaluated; its ordinary TypeScript type is preserved.
  function IfDefined<Name extends string, Yes, No>(
    name: string extends Name ? never : Name,
    whenDefined: Yes,
    whenMissing: No,
  ): IfDefined<Name, Yes, No>;

  // Substitutes project variables and environment $(env:NAME) at compile time.
  function Expand<Text extends string>(
    value: string extends Text ? never : Expand<Text> extends never ? never : Text,
  ): Constant<Expand<Text>>;

  // Creates a compile-time constant whose emitted value is the literal T.
  // has no body, because its return value is produced at compile time. The visitor plugin
  // doesn't match MakeConstant, it matches its return type, e.g.,
  // const value = MakeConstant<"hi">();
  // plugin sees the expression's return type and replaces the whole thing with
  // the literal T.
  //
  // note that Constant<Constant<T>> is equivalent to Constant<T>.
  // so this also handles cases where T is already a Constant.
  // TODO: that's not a perfect solution for nested constants; the correct solution
  // involves handling this at the Constant<> type level rather than its support helpers.
  // but that would also impose changes on the plugins i don't feel like doing.
  function MakeConstant<T extends ConstantValue>():
    T extends Constant<infer Value>
    ? Constant<Value>
    : Constant<T>;
  function assert_const<T extends ConstantValue>(value: Constant<T>): void;
}

// ticbuild preprocessor functions.
declare function __EXPAND(value: string): string;
declare function __IMPORT(pipeline: string, importReference: string): any;
declare function __ENCODE(pipeline: string, value: string): any;

// ticbuild internals used for preserving directives
declare function __TICBUILD_PREPROCESSOR_DIRECTIVE__(encodedDirective: string): void;
declare function __TICBUILD_EXPORT_GLOBAL__(name: string, value: unknown): void;
