import { Hono } from "hono";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMeHandler } from "../handlers/user/getMeHandler";

const userRoutes = new Hono()

userRoutes.get('/me', authMiddleware, getMeHandler);

export default userRoutes;