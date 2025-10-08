/**
 * Utility types for improved type safety across the application
 */

/**
 * Makes specified keys required in a type
 * @example RequireKeys<Player, 'id' | 'name'>
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Makes specified keys optional in a type
 * @example PartialKeys<Player, 'imageUrl' | 'statistics'>
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes all properties and nested properties readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Makes all properties and nested properties partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts only the keys that are of a specific type
 * @example KeysOfType<Player, string> // Returns 'name' | 'position' | etc
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Ensures at least one of the specified keys is present
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * Ensures exactly one of the specified keys is present
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

/**
 * Type-safe omit that prevents omitting non-existent keys
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Type-safe pick that prevents picking non-existent keys
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * Extracts the value type from an array
 * @example ArrayElement<Player[]> // Returns Player
 */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;

/**
 * Extracts the return type of a Promise
 * @example Awaited<Promise<Player>> // Returns Player
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Creates a type with all properties nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Removes null and undefined from a type
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Type for function that may or may not be async
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Type for values that can be arrays or single values
 */
export type MaybeArray<T> = T | T[];

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard for checking if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for checking if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if array has elements
 */
export function hasElements<T>(array: T[] | undefined | null): array is [T, ...T[]] {
  return Array.isArray(array) && array.length > 0;
}
