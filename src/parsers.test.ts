/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LoaderArgs } from '@remix-run/server-runtime';
import { FormData, Request } from '@remix-run/node';
import { z } from 'zod';
import { zx } from './';

type Params = LoaderArgs['params'];

describe('parseParams', () => {
  type Result = { id: string; age: number };
  const params: Params = { id: 'id1', age: '10' };
  const paramsResult = { id: 'id1', age: 10 };
  const schema = z.object({ id: z.string(), age: zx.IntAsString });

  test('parses params using an object', () => {
    const result = zx.parseParams(params, {
      id: z.string(),
      age: zx.IntAsString,
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
    const badParams = { ...params, age: 'not a number' };
    expect(() => zx.parseParams(badParams, schema)).toThrowError();
  });
});

describe('parseQuery', () => {
  type Result = { id: string; age: number; friends?: string[] };
  const queryResult = { id: 'id1', age: 10 };
  const schema = z.object({
    id: z.string(),
    age: zx.IntAsString,
    friends: z.array(z.string()).optional(),
  });

  test('parses URLSearchParams using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const result = zx.parseQuery(search, {
      id: z.string(),
      age: zx.IntAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses URLSearchParams using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const result = zx.parseQuery(search, schema);
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses arrays from URLSearchParams', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    search.append('friends', 'friend1');
    search.append('friends', 'friend2');
    const result = zx.parseQuery(search, {
      id: z.string(),
      age: zx.IntAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses query string from a Request using an object', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuery(request, {
      id: z.string(),
      age: zx.IntAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('parses query string from a Request using a schema', () => {
    const search = new URLSearchParams({ id: 'id1', age: '10' });
    const request = new Request(`http://example.com?${search.toString()}`);
    const result = zx.parseQuery(request, schema);
    expect(result).toStrictEqual(queryResult);
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid query params', () => {
    const badRequest = new Request(`http://example.com?id=id1&age=notanumber`);
    expect(() => zx.parseQuery(badRequest, schema)).toThrowError();
  });

  test('supports custom URLSearchParam parsers', () => {
    const search = new URLSearchParams(
      `?id=id1&age=10&friends[]=friend1&friends[]=friend2`
    );
    const result = zx.parseQuery(
      search,
      {
        id: z.string(),
        age: zx.IntAsString,
        friends: z.array(z.string()).optional(),
      },
      { parser: customParser }
    );
    expect(result).toStrictEqual({
      ...queryResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
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
  };
  const formResult = { id: 'id1', age: 10, consent: true };
  const schema = z.object({
    id: z.string(),
    age: zx.IntAsString,
    consent: zx.CheckboxAsString,
    friends: z.array(z.string()).optional(),
  });

  test('parses FormData from Request using an object', async () => {
    const request = createFormRequest();
    const result = await zx.parseForm(request, {
      id: z.string(),
      age: zx.IntAsString,
      consent: zx.CheckboxAsString,
      friends: z.array(z.string()).optional(),
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
      consent: zx.CheckboxAsString,
      friends: z.array(z.string()).optional(),
    });
    expect(result).toStrictEqual({
      ...formResult,
      friends: ['friend1', 'friend2'],
    });
    type verify = Expect<Equal<typeof result, Result>>;
  });

  test('throws for invalid FormData', () => {
    const badRequest = createFormRequest('notanumber');
    expect(() => zx.parseQuery(badRequest, schema)).toThrowError();
  });
});

// Custom URLSearchParams parser that cleanrs arr[] keys
function customParser(searchParams: URLSearchParams) {
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

// Ensure parsed results are typed correctly. Thanks Matt!
// https://github.com/total-typescript/zod-tutorial/blob/main/src/helpers/type-utils.ts
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;
