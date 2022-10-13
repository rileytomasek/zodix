# Zodix

Zodix is a collection of [Zod](https://github.com/colinhacks/zod) utilities for [Remix](https://github.com/remix-run/remix) loaders and actions. It abstracts the complexity of parsing and validating `FormData` and `URLSearchParams` so your loaders/actions stay clean and are strongly typed.

Remix loaders often look like:
```ts
export async function loader({ params, request }: LoaderArgs) {
  const { id } = params;
  const url = new URL(request.url);
  const count = url.searchParams.get('count') || '10';
  if (typeof id !== 'string') {
    throw new Error('id must be a string');
  }
  const countNumber = parseInt(count, 10);
  if (isNaN(countNumber)) {
    throw new Error('count must be a number');
  }
  // Fetch data with id and countNumber
};
```

Here is the same loader with Zodix:
```ts
export async function loader({ params, request }: LoaderArgs) {
  const { id } = zx.parseParams(params, { id: z.string() });
  const { count } = zx.parseQuery(request, { count: zx.NumAsString });
  // Fetch data with id and countNumber
};
```

## Highlights

- Significantly reduce Remix action/loader bloat
- Avoid the oddities of FormData and URLSearchParams.
- Tiny with no external dependencies. [Less than 1kb gzipped](https://bundlephobia.com/package/zodix).
- Use existing Zod schemas, or write them on the fly.
- Custom Zod schemas for stringified numbers, booleans, and checkboxes.
- Full [unit test coverage](/src)

## Install

```sh
npm install zodix zod
```

## Usage

### Import

```ts
import { zx } from 'zodix';

// Or

import { parseParams, NumAsString } from 'zodix';
```

### zx.parseParams(params: Params, schema: Schema)

Parse and validate the `Params` object from `LoaderArgs['params']` or `ActionArgs['params']` using a Zod shape:

```ts
export async function loader({ params }: LoaderArgs) {
  const { userId, noteId } = zx.parseParams(params, {
    userId: z.string(),
    noteId: z.string(),
  });
};
```

The same as above, but using an existing Zod object schema:

```ts
// This is if you have many pages that share the same params.
export const ParamsSchema = z.object({ userId: z.string(), noteId: z.string() });

export async function loader({ params }: LoaderArgs) {
  const { userId, noteId } = zx.parseParams(params, ParamsSchema);
};
```

### zx.parseForm(request: Request, schema: Schema)

Parse and validate `FormData` from a `Request` in a Remix action and avoid the tedious `FormData` dance:

```ts
export async function action({ request }: ActionArgs) {
  const { email, password, saveSession } = await zx.parseForm(request, {
    email: z.string().email(),
    password: z.string().min(6),
    saveSession: zx.CheckboxAsString,
  });
};
```

Integrate with existing Zod schemas and models/controllers:

```ts
// db.ts
export const CreatNoteSchema = z.object({
  userId: z.string(),
  title: z.string(),
  category: NoteCategorySchema.optional(),
});

export function createNote(note: z.infer<typeof CreateNoteSchema>) {}
```

```ts
import { CreateNoteSchema, createNote } from './db';

export async function action({ request }: ActionArgs) {
  const formData = await zx.parseForm(request, CreateNoteSchema);
  createNote(formData); // No TypeScript errors here
};
```


### zx.parseQuery(request: Request, schema: Schema)

Parse and validate the query string (search params) of a `Request`:

```ts
export async function loader({ request }: LoaderArgs) {
  const { count, page } = zx.parseQuery(request, {
    // NumAsString parses a string number ("5") and returns a number (5)
    count: zx.NumAsString,
    page: zx.NumAsString,
  });
};
```

## Helper Zod Schemas

Because `FormData` and `URLSearchParams` serialize all values to strings, you often end up with things like `"5"`, `"on"` and `"true"`. The helper schemas handle parsing and validating strings representing other data types and are meant to be used with the parse functions.

### Available Helpers

#### zx.BoolAsString
- `"true"` → `true`
- `"false"` → `false`
- `"notboolean"` → throws `ZodError`

#### zx.CheckboxAsString
- `"on"` → `true`
- `undefined` → `false`
- `"anythingbuton"` → throws `ZodError`

#### zx.IntAsString
- `"3"` → `3`
- `"3.14"` → throws `ZodError`
- `"notanumber"` → throws `ZodError`

#### zx.NumAsString
- `"3"` → `3`
- `"3.14"` → `3.14`
- `"notanumber"` → throws `ZodError`

See [the tests](/src/schemas.test.ts) for more details.

### Usage

```ts
const Schema = z.object({
  isAdmin: zx.BoolAsString,
  agreedToTerms: zx.CheckboxAsString,
  age: zx.IntAsString,
  cost: zx.NumAsString,
});

const parsed = Schema.parse({
  isAdmin: 'true',
  agreedToTerms: 'on',
  age: '38',
  cost: '10.99'
});

/*
parsed = {
  isAdmin: true,
  agreedToTerms: true,
  age: 38,
  cost: 10.99
}
*/
```

## Extras

### Custom `URLSearchParams` parsing

You may have URLs with query string that look like `?ids[]=1&ids[]=2` or `?ids=1,2` that aren't handled as desired by the built in `URLSearchParams` parsing.

You can pass a custom function, or use a library like [query-string](https://github.com/sindresorhus/query-string) to parse them with Zodix.

```ts
// Create a custom parser function
type ParserFunction = (params: URLSearchParams) => Record<string, string | string[]>;
const customParser: ParserFunction = () => { /* ... */ };

// Parse non-standard search params
const search = new URLSearchParams(`?ids[]=id1&ids[]=id2`);
const { ids } = zx.parseQuery(
  request,
  { ids: z.array(z.string()) })
  { parser: customParser }
);

// ids = ['id1', 'id2']
```

### Actions with Multiple Intents

Zod discriminated unions are great for helping with actions that handle multiple intents like this:

```ts
// This adds type narrowing by the intent property
const Schema = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('delete'), id: z.string() }),
  z.object({ intent: z.literal('create'), name: z.string() }),
]);

export async function action({ request }: ActionArgs) {
  const data = await zx.parseForm(request, Schema);
  switch (data.intent) {
    case 'delete':
      // data is now narrowed to { intent: 'delete', id: string }
      return;
    case 'create':
      // data is now narrowed to { intent: 'create', name: string }
      return;
    default:
      // data is now narrowed to never. This will error if a case is missing.
      const _exhaustiveCheck: never = data;
  }
};
```
