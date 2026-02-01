import { Context } from "hono";

export const testAuthHandler = async (c: Context) => {
  const userId = await c.get('userId');

  return c.json({message : "authenticated correctly", userId: userId},200)
}