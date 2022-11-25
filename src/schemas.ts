import { z } from 'zod';

/**
 * Zod schema to parse strings that are booleans.
 * Use to parse <input type="hidden" value="true" /> values.
 * @example
 * ```ts
 * BoolAsString.parse('true') -> true
 * ```
 */
export const BoolAsString = z
  .string()
  .regex(/^(true|false)$/, 'Must be a boolean string ("true" or "false")')
  .transform((value) => value === 'true');

/**
 * Zod schema to parse checkbox formdata.
 * Use to parse <input type="checkbox" /> values.
 * @example
 * ```ts
 * CheckboxAsString.parse('on') -> true
 * CheckboxAsString.parse(undefined) -> false
 * ```
 */
export const CheckboxAsString = z
  .literal('on')
  .optional()
  .transform((value) => value === 'on');

/**
 * Zod schema to parse strings that are integers.
 * Use to parse  <input type="number" /> values.
 * @example
 * ```ts
 * IntAsString.parse('3') -> 3
 * ```
 */
export const IntAsString = z
  .string()
  .regex(/^-?\d+$/, 'Must be an integer string')
  .transform((val) => parseInt(val, 10));

/**
 * Zod schema to parse strings that are numbers.
 * Use to parse <input type="number" step="0.1" /> values.
 * @example
 * ```ts
 * NumAsString.parse('3.14') -> 3.14
 * ```
 */
export const NumAsString = z
  .string()
  .regex(/^-?\d*\.?\d+$/, 'Must be a number string')
  .transform(Number);

/**
* Zod schema to parse strings that are dates.
* Use to parse <input type="date" /> and <input type="datetime-local" />
* @example
* ```ts
* DateAsString.parse('2022-11-25') => 2022-11-25T00:00:00.000Z
*/
export const DateAsString = z.preprocess(
  (arg) => (typeof arg == "string" || arg instanceof Date) && new Date(arg),
  z.date()
);
