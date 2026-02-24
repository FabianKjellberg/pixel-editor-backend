import { Hono } from 'hono'
import { testAiHandler } from '../handlers/ai/testAiHandler'

const aiRoutes = new Hono();

aiRoutes.post('/test', testAiHandler);

export default aiRoutes;
