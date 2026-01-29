import { Context } from 'hono'

export const refreshHandler = async (c: Context) => {
    return c.json({ message: 'Hello World' });
}