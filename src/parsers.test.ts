/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LoaderArgs } from '@remix-run/server-runtime';
import { FormData, NodeOnDiskFile, Request } from '@remix-run/node';
import { z } from 'zod';
import { zx } from './';

type Params = LoaderArgs['params'];

describe('parseParams', () => {
  type Result = { id: string; age: number };
  const params: Params = { id: 'id1', age: '10', date: '2022-11-29' };
  const paramsResult = { id: 'id1', age: 10, date: 2022-11-29T00:00:00.000Z };
  const schema = z.object({ id: z.string(), age: zx.IntAsString, date: zx.DateAsString });

  test('parses params using an object', () => {
    const result = zx.parseParams(params, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
    });
    expect(result).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses params using a schema', () => {
    const result = zx.parseParams(params, schema);
    expect(result).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid params', () => {
    const badParams = { ...params, age: 'not a number', date: 'not a date' };
    expect(() => zx.parseParams(badParams, schema)).toThrow();
  });
});

describe('parseParamsSafe', () => {
  type Result = { id: string; age: number };
  const params: Params = { id: 'id1', age: '10', date: '2022-11-29' };
  const paramsResult = { id: 'id1', age: 10, date: 2022-11-29T00:00:00.000Z };
  const schema = z.object({ id: z.string(), age: zx.IntAsString, date: zx.DateAsString });

  test('parses params using an object', () => {
    const result = zx.parseParamsSafe(params, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses params using a schema', () => {
    const result = zx.parseParamsSafe(params, schema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(paramsResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('returns an error for invalid params', () => {
    const badParams = { ...params, age: 'not a number', date: 'not a date' };
    const result = zx.parseParamsSafe(badParams, schema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
  });
});

describe('parseQuery', () => {
  type Result = { id: string; age: number; friends?: string[] };
  const queryResult = { id: 'id1', age: 10, date: 2022-11-29T00:00:00.000Z };
  const schema = z.object({
    id: z.string(),
    age: zx.IntAsString,
    date: zx.DateAsString,
    friends: z.array(z.string()).optional(),
  });

  test('parses URLSearchParams using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const result = zx.parseQuery(search, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses URLSearchParams using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const result = zx.parseQuery(search, schema);
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses arrays from URLSearchParams', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuery(search, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses query string from a Request using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuery(request, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses query string from a Request using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuery(request, schema);
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid query params', () => {
    const badRequest = new Request(`http://example.com?id=id1&age=notanumber`);
    expect(() => zx.parseQuery(badRequest, schema)).toThrow();
  });

  test('supports custom URLSearchParam parsers', () => {
    const search = new URLSearchParams(
      `?id=id1&age=10&date=2022-11-29&friends[]=friend1&friends[]=friend2`
    );
    const result = zx.parseQuery(
      search,
      {
        id: z.string(),
        age: zx.IntAsString,
        date: zx.DateAsString,
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
});

describe('parseQuerySafe', () => {
  type Result = { id: string; age: number; friends?: string[] };
  const queryResult = { id: 'id1', age: 10, date: 2022-11-29T00:00:00.000Z };
  const schema = z.object({
    id: z.string(),
    age: zx.IntAsString,
    date: zx.DateAsString,
    friends: z.array(z.string()).optional(),
  });

  test('parses URLSearchParams using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const result = zx.parseQuerySafe(search, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses URLSearchParams using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const result = zx.parseQuerySafe(search, schema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses arrays from URLSearchParams', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuerySafe(search, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
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

  test('parses query string from a Request using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuerySafe(request, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses query string from a Request using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10', date: '2022-11-29' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuerySafe(request, schema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('returns an error for invalid query params', () => {
    const badRequest = new Request(`http://example.com?id=id1&age=notanumber&date=notadate`);
    const result = zx.parseQuerySafe(badRequest, schema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
  });
});

const createFormRequest = (age: string = '10', date: string = '2022-11-29') => {
  const form = new FormData();
  form.append('id', 'id1');
  form.append('age', age);
  form.append('date', date);
  form.append('consent', 'on');
  return new Request('http://example.com', { method: 'POST', body: form });
};

describe('parseForm', () => {
  type Result = {
    id: string;
    age: number;
    date: date;
    consent: boolean;
    friends?: string[];
    image?: NodeOnDiskFile;
  };
  const formResult = { id: 'id1', age: 10, date: 2022-11-29T00:00:00.000Z, consent: true };
  const schema = z.object({
    id: z.string(),
    age: zx.IntAsString,
    date: zx.DateAsString,
    consent: zx.CheckboxAsString,
    friends: z.array(z.string()).optional(),
    image: z.instanceof(NodeOnDiskFile).optional(),
  });

  test('parses FormData from Request using an object', async () => {
    const request = createFormRequest();
    const result = await zx.parseForm(request, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      consent: zx.CheckboxAsString,
      friends: z.array(z.string()).optional(),
      image: z.instanceof(NodeOnDiskFile).optional(),
    });
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from Request using a schema', async () => {
    const request = createFormRequest();
    const result = await zx.parseForm(request, schema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses FormData from FormData using a schema', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseForm(formData, schema);
    expect(result).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses arrays from FormData of a Request', async () => {
    const form = new FormData();
    form.append('id', 'id1');
    form.append('age', '10');
    form.append('date', '2022-11-29');
    form.append('friends', 'friend1');
    form.append('friends', 'friend2');
    form.append('consent', 'on');
    const request = new Request('http://example.com', {
      method: 'POST',
      body: form,
    });
    const result = await zx.parseForm(request, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      consent: zx.CheckboxAsString,
      friends: z.array(z.string()).optional(),
      image: z.instanceof(NodeOnDiskFile).optional(),
    });
    expect(result).toStrictEqual({
      ...formResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses objects keys of FormData from FormData', async () => {
    const request = createFormRequest();
    const form = await request.formData();
    const image = new NodeOnDiskFile('public/image.jpeg', 'image/jpeg');
    form.append('image', image);
    const parser = getCustomFileParser('image');
    const result = await zx.parseForm<typeof schema, typeof parser>(
      form,
      schema,
      { parser }
    );
    expect(result).toStrictEqual({
      ...formResult,
      image,
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid FormData', () => {
    const badRequest = createFormRequest('notanumber');
    expect(() => zx.parseQuery(badRequest, schema)).toThrow();
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
  const formResult = { id: 'id1', age: 10, date: 2022-11-29T00:00:00.000Z, consent: true };
  const schema = z.object({
    id: z.string(),
    age: zx.IntAsString,
    date: zx.DateAsString,
    consent: zx.CheckboxAsString,
    friends: z.array(z.string()).optional(),
    image: z.instanceof(NodeOnDiskFile).optional(),
  });

  test('parses FormData from Request using an object', async () => {
    const request = createFormRequest();
    const result = await zx.parseFormSafe(request, {
      id: z.string(),
      age: zx.IntAsString,
      date: zx.DateAsString,
      consent: zx.CheckboxAsString,
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
    const result = await zx.parseFormSafe(request, schema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('parses FormData from FormData using a schema', async () => {
    const formData = await createFormRequest().formData();
    const result = await zx.parseFormSafe(formData, schema);
    expect(result.success).toBe(true);
    if (result.success !== true) throw new Error('Parsing failed');
    expect(result.data).toStrictEqual(formResult);
    type verify = Expect<Equal<typeof result.data, Result>>;
  });

  test('returns an error for invalid FormData', async () => {
    const badRequest = createFormRequest('notanumber');
    const result = await zx.parseFormSafe(badRequest, schema);
    expect(result.success).toBe(false);
    if (result.success !== false) throw new Error('Parsing should have failed');
    expect(result.error.issues.length).toBe(1);
    expect(result.error.issues[0].path[0]).toBe('age');
    expect(result.error.issues[1].path[0]).toBe('date');
  });

  test('parses objects keys of FormData from FormData', async () => {
    const request = createFormRequest();
    const form = await request.formData();
    const image = new NodeOnDiskFile('public/image.jpeg', 'image/jpeg');
    form.append('image', image);
    const parser = getCustomFileParser('image');
    const result = await zx.parseFormSafe<typeof schema, typeof parser>(
      form,
      schema,
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
