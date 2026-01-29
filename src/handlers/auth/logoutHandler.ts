import { Context } from "hono"

export const logoutHandler = async (c: Context) => {
    return c.json({ message: 'Hello World' })
}