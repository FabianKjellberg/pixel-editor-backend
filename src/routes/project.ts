import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/authMiddleware';
import { createProjectHandler } from '../handlers/project/createProjectHandler';
import { getMyProjectPreviewsHandler } from '../handlers/project/getMyProjectPreviewsHandler'

const projectRoutes = new Hono();

// create a new project
projectRoutes.post('/create', authMiddleware, createProjectHandler)

projectRoutes.get('/previews', authMiddleware, getMyProjectPreviewsHandler)

export default projectRoutes