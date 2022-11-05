import { Form, useActionData } from "@remix-run/react";
import { ActionArgs, json } from "@remix-run/server-runtime";
import { z, ZodError } from "zod";
import { zx } from "../../../src";

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

// Check if there is an error for a specific path.
function errorAtPath(error: ZodError, path: string) {
  return error.issues.find((issue) => issue.path[0] === path)?.message;
}

export async function action(args: ActionArgs) {
  const result = await zx.parseFormSafe(args.request, schema);
  if (result.success) {
    return json({ success: true, emailError: null, passwordError: null });
  }
  // Get the error messages and return them to the client.
  return json({
    success: false,
    emailError: errorAtPath(result.error, "email"),
    passwordError: errorAtPath(result.error, "password"),
  });
}

export default function Login() {
  const data = useActionData<typeof action>();
  if (data?.success) {
    return <h1>Success!</h1>;
  }
  return (
    <>
      <h1>Login</h1>
      <Form method="post">
        <p>
          <label>Email:</label>
          <input name="email" />
          {data?.emailError && <div>{data.emailError}</div>}
        </p>
        <p>
          <label>Password:</label>
          <input type="password" name="password" />
          {data?.passwordError && <div>{data.passwordError}</div>}
        </p>
        <button type="submit">Login</button>
      </Form>
    </>
  );
}
