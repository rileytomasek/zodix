import { useCatch, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { zx } from "../../../../src/index";

async function getPost(postId: number) {
  return Promise.resolve({
    id: postId,
    title: "A post",
    body: "This is a post",
  });
}

export async function loader({ params }: LoaderArgs) {
  // try {
  const { postId } = zx.parseParams(
    params,
    { postId: zx.NumAsString },
    // Set a custom message and status code for the response Zodix throws
    // when parsing throws.
    { message: "Invalid postId parameter", status: 400 }
  );
  const post = await getPost(postId);
  return { post };
}

export default function PostPage() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>{post.title}</h1>
      <p>Post ID: {post.id}</p>
      <p>{post.body}</p>
    </div>
  );
}

// Catch the error response thrown by Zodix when parsing fails.
export function CatchBoundary() {
  const caught = useCatch();
  return <h1>Caught error: {caught.statusText}</h1>;
}
