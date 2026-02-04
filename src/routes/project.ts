import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/authMiddleware';
import { createProjectHandler } from '../handlers/project/createProjectHandler';

const projectRoutes = new Hono();

// create a new project
projectRoutes.post('/create', authMiddleware, createProjectHandler)

export default projectRoutes