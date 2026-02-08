import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/authMiddleware'
import { saveLayerHandler } from '../handlers/layer/saveLayerHandler';
import { moveLayerHandler } from '../handlers/layer/moveLayerHandler';
import { renameLayerHandler } from '../handlers/layer/renameLayerHandler';
import { addLayerHandler } from '../handlers/layer/addLayerHandler';
import { deleteLayerHandler } from '../handlers/layer/deleteLayerHandler';

const layerRoutes = new Hono();

// saves metadata for layer and generates preview and layer signed urls
layerRoutes.put('/save', authMiddleware, saveLayerHandler);

// deletes a layer and removes its blob an signs previewUrl if needed
layerRoutes.delete('/delete', authMiddleware, deleteLayerHandler);

// adds a new layer
layerRoutes.post('/create', authMiddleware, addLayerHandler);

//renames a layer 
layerRoutes.put('/name', authMiddleware, renameLayerHandler);

//update zindexes for layers
layerRoutes.put('/move', authMiddleware, moveLayerHandler);

export default layerRoutes