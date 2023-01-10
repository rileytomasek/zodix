import { z } from 'zod';
import type { errorUtil } from 'zod/lib/helpers/errorUtil';

/**
 * Zod schema to parse strings that are booleans.
 * Use to parse <input type="hidden" value="true" /> values.
 * @example
 * ```ts
 * boolAsString().parse('true') -> true
 * ```
 */
export const boolAsString = (
  message:
    | errorUtil.ErrMessage
    | undefined = 'Must be a boolean string ("true" or "false")'
) =>
  z
    .string()
    .regex(/^(true|false)$/, message)
    .transform((value) => value === 'true');

/**
 * Zod schema to parse checkbox formdata.
 * Use to parse <input type="checkbox" /> values.
 * @example
 * ```ts
 * checkboxAsString().parse('on') -> true
 * checkboxAsString().parse(undefined) -> false
 * ```
 */
export const checkboxAsString = ({
  trueValue = 'on',
  ...params
}: {
  trueValue?: string;
} & Parameters<typeof z.union>[1] = {}) =>
  z.union(
    [
      z.literal(trueValue).transform(() => true),
      z.literal(undefined).transform(() => false),
    ],
    params
  );

/**
 * Zod schema to parse strings that are integers.
 * Use to parse  <input type="number" /> values.
 * @example
 * ```ts
 * intAsString.parse('3') -> 3
 * ```
 */
export const intAsString = (
  message: errorUtil.ErrMessage | undefined = 'Must be an integer string'
) =>
  z
    .string()
    .regex(/^-?\d+$/, message)
    .transform((val) => parseInt(val, 10));

/**
 * Zod schema to parse strings that are numbers.
 * Use to parse <input type="number" step="0.1" /> values.
 * @example
 * ```ts
 * numAsString().parse('3.14') -> 3.14
 * ```
 */
export const numAsString = (
  message: errorUtil.ErrMessage | undefined = 'Must be a number string'
) =>
  z
    .string()
    .regex(/^-?\d*\.?\d+$/, message)
    .transform(Number);
