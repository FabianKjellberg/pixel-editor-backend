import { Context } from "hono"

export const registerHandler = async (c: Context) => {
    return c.json({ message: 'Hello World' })
}