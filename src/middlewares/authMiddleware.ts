import { Context } from "hono"

export const authMiddleware = async (c: Context) => {
    console.log('hej')
}