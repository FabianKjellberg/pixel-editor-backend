import { Context } from "hono"

type LoginBody = {
    username: string;
    password: string;
}

export const loginHandler = async (c: Context) => {
    const body = await c.req.json<LoginBody>();


}