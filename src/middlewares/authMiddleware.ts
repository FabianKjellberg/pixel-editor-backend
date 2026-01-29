import { Context } from "hono"
import { jwt } from "hono/jwt";

export const authMiddleware = async (c: Context) => {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return c.json({ message: 'Unauthorized' }, 401);
    }
    const decoded = await jwt.verify(token, c.env.JWT_SECRET);
    if (!decoded) {
        return c.json({ message: 'Unauthorized' }, 401);
    }
    return c.json({ message: 'Authorized' });
}