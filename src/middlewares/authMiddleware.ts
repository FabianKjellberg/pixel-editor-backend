import { Context } from "hono"
import { jwtVerify } from "jose";

export const authMiddleware = async (
  c: Context, 
  next : () => Promise<void>
) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    const userId = payload.sub as string;

    if (!userId) {
      return c.json({ message: "Invalid or expired token" }, 401);
    }

    c.set("userId", userId);

    await next();
  } catch {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
}