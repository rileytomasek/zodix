import { Form, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { z } from "zod";
import { zx } from "../../../src";

export async function loader(args: LoaderArgs) {
  const { query } = zx.parseQuery(args.request, {
    query: z.string().optional(),
  });
  const results = query ? searchAnimals(query) : [];
  return json({ query, results });
}

export default function Search() {
  const { query, results } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Search</h1>
      <Form method="get">
        <input name="query" defaultValue={query} />
        <button type="submit">Search</button>
      </Form>
      {results.length > 0 && (
        <div>
          <h2>Results for "{query}":</h2>
          <ul>
            {results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function searchAnimals(query: string) {
  return [
    "dog",
    "cat",
    "bird",
    "fish",
    "whale",
    "dolphin",
    "shark",
    "tiger",
    "lion",
    "elephant",
    "giraffe",
    "zebra",
    "horse",
    "cow",
    "pig",
    "chicken",
    "duck",
    "goose",
    "frog",
    "snake",
    "lizard",
    "turtle",
  ].filter((animal) => animal.includes(query));
}
