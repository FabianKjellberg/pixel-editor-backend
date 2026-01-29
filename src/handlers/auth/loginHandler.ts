import { Context } from "hono"

export const loginHandler = async (c: Context) => {
    return c.json({ message: 'Hello World' })
}