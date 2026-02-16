import { Context } from 'hono'

export const testAiHandler = async (c: Context) => {
    return c.json({message:"hello"}, 200)
}