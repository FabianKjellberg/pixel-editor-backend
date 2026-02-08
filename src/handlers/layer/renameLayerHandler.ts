import { Context } from 'hono';
import { queries } from '../../queries';

type RenameLayerRequestBody = {
  layerId: string,
  name: string,
}

export const renameLayerHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = await c.get("userId");
    const body = await c.req.json<RenameLayerRequestBody>();

    const project = await queries.project.GetProjectFromLayerId(db, userId, body.layerId);

    if(!project) return c.json({message: "not found"}, 404);

    await queries.layer.UpdateLayerName(db, body.layerId, body.name);

    return c.json({message: "successfully changed name"}, 200);
  }
  catch (error) {
    console.error('Error renaming layer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}