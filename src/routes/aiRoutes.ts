import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware';
import { testAiHandler } from '../handlers/ai/testAiHandler';

const aiRoutes = new Hono();

aiRoutes.get('/test', authMiddleware, testAiHandler)

export default aiRoutes;