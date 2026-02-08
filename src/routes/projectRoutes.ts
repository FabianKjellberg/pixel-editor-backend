import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/authMiddleware';
import { createProjectHandler } from '../handlers/project/createProjectHandler';
import { getMyProjectPreviewsHandler } from '../handlers/project/getMyProjectPreviewsHandler'
import { getProjectHandler } from '../handlers/project/getProjectHandler';
import { updateCanvasSizeHandler } from '../handlers/project/updateCanvasSizeHandler';

const projectRoutes = new Hono();

// create a new project
projectRoutes.post('/create', authMiddleware, createProjectHandler);

// get previews for your own projects with signed links
projectRoutes.get('/previews', authMiddleware, getMyProjectPreviewsHandler);

// get a project and its layers with signed links
projectRoutes.get('/:id', authMiddleware, getProjectHandler);

// changes dimensions of a canvas
projectRoutes.put('/size',authMiddleware, updateCanvasSizeHandler); 

export default projectRoutes