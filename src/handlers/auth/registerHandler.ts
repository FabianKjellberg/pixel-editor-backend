import { Context } from "hono"
import { queries } from "../../queries"
import type { D1Database } from "@cloudflare/workers-types"
import { hash } from "bcryptjs"

type RegisterBody = {
  username: string;
  password: string;
}

/**
 * registers a new user
 * @param c - request context object
 * @returns a JSON response with a message and a status code
 */
export const registerHandler = async (c: Context) => {
  try {
    const body = await c.req.json<RegisterBody>();

    const db = c.env.DB as D1Database;

    const isAvailable = await queries.users.usernameExists(db, body.username);

    if (!isAvailable) {
      return c.json({ error: 'username already exists' }, 409);
    }

    const id = crypto.randomUUID();

    const passwordHash = await hash(body.password, 10);

    await queries.users.createUser(db, { id, username: body.username, passwordHash })

    return c.json({ message: 'user created successfully' }, 200);
  }
  catch (error) {
    console.error('Error registering user:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }

}