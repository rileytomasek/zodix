/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LoaderArgs } from '@remix-run/server-runtime';
import type { ZodEffects, ZodObject, ZodRawShape } from 'zod';
import { FormData, NodeOnDiskFile, Request } from '@remix-run/node';
import { z } from 'zod';
import { zx } from './';

type Params = LoaderArgs['params'];

describe('parseParams', () => {
  type Result = { id: string; age: number };
  const params: Params = { id: 'id1', age: '10' };
  const paramsResult = { id: 'id1', age: 10 };
  const objectSchema = { id: z.string(), age: zx.intAsString() };
  const zodSchema = z.object(objectSchema);

  test('parses params using an object', () => {
    const result = zx.parseParams(params, objectSchema);
    expect(result).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses params using a schema', () => {
    const result = zx.parseParams(params, zodSchema);
    expect(result).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid params using an object', () => {
    const badParams = { ...params, age: 'not a number' };
    expect(() => zx.parseParams(badParams, objectSchema)).toThrow();
  });

  test('throws for invalid params using a schema', () => {
    const badParams = { ...params, age: 'not a number' };
    expect(() => zx.parseParams(badParams, zodSchema)).toThrow();
  });
});

describe('parseParamsSafe', () => {
  type Result = { id: string; age: number };
  const params: Params = { id: 'id1', age: '10' };
  const paramsResult = { id: 'id1', age: 10 };
  const objectSchema = { id: z.string(), age: zx.intAsString() };
  const zodSchema = z.object(objectSchema);

  test('parses params using an object', () => {
    const result = zx.parseParamsSafe(params, {
      id: z.string(),
      age: zx.intAsString(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses params using a schema', () => {
    const result = zx.parseParamsSafe(params, zodSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('returns an error for invalid params using an object', () => {
    const badParams = { ...params, age: 'not a number' };
    const result = zx.parseParamsSafe(badParams, objectSchema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
  });

  test('returns an error for invalid params using a schema', () => {
    const badParams = { ...params, age: 'not a number' };
    const result = zx.parseParamsSafe(badParams, zodSchema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
  });
});

describe('parseQuery', () => {
  type Result = { id: string; age: number; friends?: string[] };
  const search = new URLSearchParams({ id: 'id1', age: '10' });
  const queryResult = { id: 'id1', age: 10 };
  const objectSchema = {
    id: z.string(),
    age: zx.intAsString(),
    friends: z.array(z.string()).optional(),
  };
  const zodSchema = z.object(objectSchema);

  test('parses URLSearchParams using an object', () => {
    const result = zx.parseQuery(search, {
      id: z.string(),
      age: zx.intAsString(),
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses URLSearchParams using a schema', () => {
    const result = zx.parseQuery(search, zodSchema);
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses arrays from URLSearchParams using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuery(search, {
      id: z.string(),
      age: zx.intAsString(),
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses arrays from URLSearchParams using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuery(search, zodSchema);
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses query string from a Request using an object', () => {
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuery(request, {
      id: z.string(),
      age: zx.intAsString(),
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses query string from a Request using a schema', () => {
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuery(request, zodSchema);
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid query params using an object', () => {
    const badRequest = new Request(`http://example.com?id=id1&age=notanumber`);
    expect(() => zx.parseQuery(badRequest, zodSchema)).toThrow();
  });

  test('throws for invalid query params using a schema', () => {
    const badRequest = new Request(`http://example.com?id=id1&age=notanumber`);
    expect(() => zx.parseQuery(badRequest, zodSchema)).toThrow();
  });

  test('supports custom URLSearchParam parsers using an object', () => {
    const search = new URLSearchParams(
      `?id=id1&age=10&friends[]=friend1&friends[]=friend2`
    );
    const result = zx.parseQuery(
      search,
      {
        id: z.string(),
        age: zx.intAsString(),
        friends: z.array(z.string()).optional(),
      },
      { parser: customArrayParser }
    );
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('supports custom URLSearchParam parsers using a schema', () => {
    const search = new URLSearchParams(
      `?id=id1&age=10&friends[]=friend1&friends[]=friend2`
    );
    const result = zx.parseQuery(search, zodSchema, {
      parser: customArrayParser,
    });
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });
});

describe('parseQuerySafe', () => {
  type Result = { id: string; age: number; friends?: string[] };
  const queryResult = { id: 'id1', age: 10 };
  const zodSchema = z.object({
    id: z.string(),
    age: zx.intAsString(),
    friends: z.array(z.string()).optional(),
  });

  test('parses URLSearchParams using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const result = zx.parseQuerySafe(search, {
      id: z.string(),
      age: zx.intAsString(),
      friends: z.array(z.string()).optional(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses URLSearchParams using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const result = zx.parseQuerySafe(search, zodSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses arrays from URLSearchParams using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuerySafe(search, {
      id: z.string(),
      age: zx.intAsString(),
      friends: z.array(z.string()).optional(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses arrays from URLSearchParams using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuerySafe(search, zodSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses query string from a Request using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuerySafe(request, {
      id: z.string(),
      age: zx.intAsString(),
      friends: z.array(z.string()).optional(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses query string from a Request using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuerySafe(request, zodSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('returns an error for invalid query params using a schema', () => {
    const badRequest = new Request(`http://example.com?id=id1&age=notanumber`);
    const result = zx.parseQuerySafe(badRequest, zodSchema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
  });
});

const createFormRequest = (age: string = '10') => {
  const form = new FormData();
  form.append('id', 'id1');
  form.append('age', age);
  form.append('consent', 'on');
  return new Request('http://example.com', { method: 'POST', body: form });
};

describe('parseForm', () => {
  type Result = {
    id: string;
    age: number;
    consent: boolean;
    friends?: string[];
    image?: NodeOnDiskFile;
  };
  const formResult = { id: 'id1', age: 10, consent: true };
  const objectSchema = {
    id: z.string(),
    age: zx.intAsString(),
    consent: zx.checkboxAsString(),
    friends: z.array(z.string()).optional(),
    image: z.instanceof(NodeOnDiskFile).optional(),
  };
  const zodSchema = z.object(objectSchema);
  const asyncSchema = zodSchema.transform((data) => Promise.resolve(data));

  test('parses FormData from Request using an object', async () => {
    const request = createFormRequest();
    const result = await zx.parseForm(request, objectSchema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from Request using a schema', async () => {
    const request = createFormRequest();
    const result = await zx.parseForm(request, zodSchema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from Request using an async schema', async () => {
    const request = createFormRequest();
    const result = await zx.parseForm(request, asyncSchema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from FormData using an object', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseForm(formData, objectSchema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from FormData using a schema', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseForm(formData, zodSchema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from FormData using an async schema', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseForm(formData, asyncSchema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses arrays from FormData of a Request using an object', async () => {
    const form = new FormData();
    form.append('id', 'id1');
    form.append('age', '10');
    form.append('friends', 'friend1');
    form.append('friends', 'friend2');
    form.append('consent', 'on');
    const request = new Request('http://example.com', {
      method: 'POST',
      body: form,
    });
    const result = await zx.parseForm(request, {
      id: z.string(),
      age: zx.intAsString(),
      consent: zx.checkboxAsString(),
      friends: z.array(z.string()).optional(),
      image: z.instanceof(NodeOnDiskFile).optional(),
    });
    expect(result).toStrictEqual({
      ...formResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses objects keys of FormData from FormData using a schema', async () => {
    const request = createFormRequest();
    const form = await request.formData();
    const image = new NodeOnDiskFile('public/image.jpeg', 'image/jpeg');
    form.append('image', image);
    const parser = getCustomFileParser('image');
    const result = await zx.parseForm<typeof zodSchema, typeof parser>(
      form,
      zodSchema,
      { parser }
    );
    expect(result).toStrictEqual({
      ...formResult,
      image,
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses objects keys of FormData from FormData using an async schema', async () => {
    const request = createFormRequest();
    const form = await request.formData();
    const image = new NodeOnDiskFile('public/image.jpeg', 'image/jpeg');
    form.append('image', image);
    const parser = getCustomFileParser('image');
    const result = await zx.parseForm<typeof asyncSchema, typeof parser>(
      form,
      asyncSchema,
      { parser }
    );
    expect(result).toStrictEqual({
      ...formResult,
      image,
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid FormData using an object', async () => {
    const badRequest = createFormRequest('notanumber');
    await expect(zx.parseForm(badRequest, objectSchema)).rejects.toBeInstanceOf(Response)
  });

  test('throws for invalid FormData using a schema', async () => {
    const badRequest = createFormRequest('notanumber');
    await expect(zx.parseForm(badRequest, zodSchema)).rejects.toBeInstanceOf(Response)
  });

  test('throws for invalid FormData using an async schema', async () => {
    const badRequest = createFormRequest('notanumber');
    await expect(zx.parseForm(badRequest, asyncSchema)).rejects.toBeInstanceOf(Response)
  });
});

describe('parseFormSafe', () => {
  type Result = {
    id: string;
    age: number;
    consent: boolean;
    friends?: string[];
    image?: NodeOnDiskFile;
  };
  const formResult = { id: 'id1', age: 10, consent: true };
  const zodSchema = z.object({
    id: z.string(),
    age: zx.intAsString(),
    consent: zx.checkboxAsString(),
    friends: z.array(z.string()).optional(),
    image: z.instanceof(NodeOnDiskFile).optional(),
  });
  const asyncSchema = zodSchema.transform((data) => Promise.resolve(data));

  test('parses FormData from Request using an object', async () => {
    const request = createFormRequest();
    const result = await zx.parseFormSafe(request, {
      id: z.string(),
      age: zx.intAsString(),
      consent: zx.checkboxAsString(),
      friends: z.array(z.string()).optional(),
      image: z.instanceof(NodeOnDiskFile).optional(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses FormData from Request using a schema', async () => {
    const request = createFormRequest();
    const result = await zx.parseFormSafe(request, zodSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses FormData from Request using an async schema', async () => {
    const request = createFormRequest();
    const result = await zx.parseFormSafe(request, asyncSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses FormData from FormData using a schema', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseFormSafe(formData, zodSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses FormData from FormData using an async schema', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseFormSafe(formData, asyncSchema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('returns an error for invalid FormData', async () => {
    const badRequest = createFormRequest('notanumber');
    const result = await zx.parseFormSafe(badRequest, zodSchema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
  });

  test('parses objects keys of FormData from FormData using a schema', async () => {
    const request = createFormRequest();
    const form = await request.formData();
    const image = new NodeOnDiskFile('public/image.jpeg', 'image/jpeg');
    form.append('image', image);
    const parser = getCustomFileParser('image');
    const result = await zx.parseFormSafe<typeof zodSchema, typeof parser>(
      form,
      zodSchema,
      { parser }
    );
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual({
      ...formResult,
      image,
    });
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses objects keys of FormData from FormData using an async schema', async () => {
    const request = createFormRequest();
    const form = await request.formData();
    const image = new NodeOnDiskFile('public/image.jpeg', 'image/jpeg');
    form.append('image', image);
    const parser = getCustomFileParser('image');
    const result = await zx.parseFormSafe<typeof asyncSchema, typeof parser>(
      form,
      asyncSchema,
      { parser }
    );
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual({
      ...formResult,
      image,
    });
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses FormData from FormData using a ZodEffects schema', async () => {
    const schema = z
      .object({
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
      })
      .refine(({ password, confirmPassword }) => password === confirmPassword);
    const data = {
      password: 'foo',
      confirmPassword: 'bar ',
    };
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.set(key, value);
    });
    const zodixResult = await zx.parseFormSafe(formData, schema);
    const zodResult = await schema.safeParseAsync(data);
    expect(zodixResult).toStrictEqual(zodResult);
    type verify = Expect<Equal<typeof zodixResult, typeof zodResult>>;
  });
});

// Custom URLSearchParams parser that cleans arr[] keys
function customArrayParser(searchParams: URLSearchParams) {
  const values: { [key: string]: string | string[] } = {};
  for (const [key, value] of searchParams) {
    // Remove trailing [] from array keys
    const cleanKey = key.replace(/\[\]$/, '');
    const currentVal = values[cleanKey];
    if (currentVal && Array.isArray(currentVal)) {
      currentVal.push(value);
    } else if (currentVal) {
      values[cleanKey] = [currentVal, value];
    } else {
      values[cleanKey] = value;
    }
  }
  return values;
}

// Custom URLSearchParams parser that casts a set of key to NodeOnDiskFile
type CustomParsedSearchParams = {
  [key: string]: string | string[] | NodeOnDiskFile;
};
function getCustomFileParser(...fileKeys: string[]) {
  return function (searchParams: URLSearchParams) {
    const values: CustomParsedSearchParams = {};
    for (const [key, value] of searchParams) {
      const currentVal = values[key];
      if (fileKeys.includes(key)) {
        const obj = JSON.parse(value);
        values[key] = new NodeOnDiskFile(obj.filepath, obj.type, obj.slicer);
      } else if (currentVal && Array.isArray(currentVal)) {
        currentVal.push(value);
      } else if (currentVal && typeof currentVal === 'string') {
        values[key] = [currentVal, value];
      } else {
        values[key] = value;
      }
    }
    return values;
  };
}
// Ensure parsed results are typed correctly. Thanks Matt!
// https://github.com/total-typescript/zod-tutorial/blob/main/src/helpers/type-utils.ts
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;
