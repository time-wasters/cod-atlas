export type JsonObject = Record<string, unknown>;

/**
 * Validates that a value is a non-null, non-array object.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated value as a JSON object.
 *
 * @throws Error
 * Thrown if the value is not an object.
 */
export function objectValue(value: unknown, path: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as JsonObject;
}

/**
 * Validates that a value is an array.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated array.
 *
 * @throws Error
 * Thrown if the value is not an array.
 */
export function arrayValue(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  return value;
}

/**
 * Validates that a value is a string.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated string.
 *
 * @throws Error
 * Thrown if the value is not a string.
 */
export function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") throw new Error(`${path} must be a string`);
  return value;
}

/**
 * Validates that a value is a finite number.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated finite number.
 *
 * @throws Error
 * Thrown if the value is not a finite number.
 */
export function numberValue(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number`);
  }
  return value;
}


/**
 * Validates that a value is a boolean.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated boolean.
 *
 * @throws Error
 * Thrown if the value is not a boolean.
 */
export function booleanValue(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${path} must be a boolean`);
  return value;
}

/**
 * Validates that a value is either a string or `null`.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated string, or `null` when the input is `null`.
 *
 * @throws Error
 * Thrown if the value is neither a string nor `null`.
 */
export function nullableStringValue(value: unknown, path: string): string | null {
  if (value === null) return null;
  return stringValue(value, path);
}

/**
 * Validates an optional nullable string value when it is present.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 *
 * @throws Error
 * Thrown if a non-null, defined value is not a string.
 */
export function optionalStringValue(value: unknown, path: string): void {
  if (value !== undefined && value !== null) stringValue(value, path);
}

/**
 * Validates that a value is a string contained in an allowed set of values.
 *
 * @param value - The value to validate.
 * @param allowed - The set of supported string values.
 * @param path - The data path used to identify the value in validation errors.
 * @returns The validated string value.
 *
 * @throws Error
 * Thrown if the value is not a string or is not contained in the allowed set.
 */
export function enumValue(value: unknown, allowed: Set<string>, path: string): string {
  const candidate = stringValue(value, path);
  if (!allowed.has(candidate)) throw new Error(`${path} has unsupported value ${candidate}`);
  return candidate;
}

/**
 * Validates a coordinate tuple containing exactly two finite numbers.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 *
 * @throws Error
 * Thrown if the value is not a two-element array of finite numbers.
 */
export function coordinateTuple(value: unknown, path: string): void {
  const coordinates = arrayValue(value, path);
  if (coordinates.length !== 2) throw new Error(`${path} must contain exactly two coordinates`);
  numberValue(coordinates[0], `${path}[0]`);
  numberValue(coordinates[1], `${path}[1]`);
}

/**
 * Validates an optional coordinate tuple when it is present.
 *
 * @param value - The value to validate.
 * @param path - The data path used to identify the value in validation errors.
 *
 * @throws Error
 * Thrown if a non-null, defined value is not a valid coordinate tuple.
 */
export function optionalCoordinateTuple(value: unknown, path: string): void {
  if (value !== undefined && value !== null) coordinateTuple(value, path);
}
