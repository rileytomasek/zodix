import { z, ZodType } from "zod";
import type { ZodRawShape, ZodTypeAny } from "zod";
import type { LoaderArgs } from "@remix-run/node";

type Params = LoaderArgs["params"];

type Options = {
  /**
   * Custom URLSearchParams parsing function.
   */
  parser?: SearchParamsParser;
};

/**
 * Generic return type for parsing function.
 */
type ParsedData<T extends ZodRawShape | ZodTypeAny> = T extends ZodTypeAny
  ? z.output<T>
  : T extends ZodRawShape
  ? z.output<z.ZodObject<T>>
  : never;

/**
 * Parse and validate Params from LoaderArgs or ActionArgs.
 * @param params - A Remix Params object.
 * @param schema - A Zod object shape or object schema to validate.
 */
export function parseParams<T extends ZodRawShape | ZodTypeAny>(
  params: Params,
  schema: T
): ParsedData<T> {
  const finalSchema = schema instanceof ZodType ? schema : z.object(schema);
  return finalSchema.parse(params);
}

/**
 * Parse and validate URLSearchParams or a Request
 * @param request - A Request or URLSearchParams
 * @param schema - A Zod object shape or object schema to validate.
 */
export function parseQuery<T extends ZodRawShape | z.ZodTypeAny>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options
): ParsedData<T> {
  const searchParams =
    request instanceof URLSearchParams
      ? request
      : getSearchParamsFromRequest(request);
  const params = parseSearchParams(searchParams, options?.parser);
  const finalSchema = schema instanceof ZodType ? schema : z.object(schema);
  return finalSchema.parse(params);
}

/**
 * Parse and validate FormData from a Request
 * @param request - A Request
 * @param schema - A Zod object shape or object schema to validate.
 */
export async function parseForm<T extends ZodRawShape | z.ZodTypeAny>(
  request: Request,
  schema: T,
  options?: Options
): Promise<ParsedData<T>> {
  const data = await parseFormData(request, options?.parser);
  const finalSchema = schema instanceof ZodType ? schema : z.object(schema);
  return finalSchema.parse(data);
}

/**
 * The data returned from parsing a URLSearchParams object.
 */
type ParsedSearchParams = Record<string, string | string[]>;

/**
 * Function signature to allow for custom URLSearchParams parsing.
 */
type SearchParamsParser = (searchParams: URLSearchParams) => ParsedSearchParams;

/**
 * Get the form data from a request as an object.
 */
async function parseFormData(
  request: Request,
  customParser?: SearchParamsParser
) {
  const formData = await request.clone().formData();
  // @ts-ignore: the types are wrong here. see: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams
  return parseSearchParams(new URLSearchParams(formData), customParser);
}

/**
 * Get the URLSearchParams as an object.
 */
function parseSearchParams(
  searchParams: URLSearchParams,
  customParser?: SearchParamsParser
): ParsedSearchParams {
  const parser = customParser || parseSearchParamsDefault;
  return parser(searchParams);
}

/**
 * The default parser for URLSearchParams.
 * Get the search params as an object. Create arrays for duplicate keys.
 */
const parseSearchParamsDefault: SearchParamsParser = (searchParams) => {
  const values: ParsedSearchParams = {};
  for (const [key, value] of searchParams) {
    const currentVal = values[key];
    if (currentVal && Array.isArray(currentVal)) {
      currentVal.push(value);
    } else if (currentVal) {
      values[key] = [currentVal, value];
    } else {
      values[key] = value;
    }
  }
  return values;
};

/**
 * Get the search params from a request.
 */
function getSearchParamsFromRequest(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}
