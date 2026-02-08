import { Context } from 'hono';
import { makeObjectUrl, makeSigner } from '../../util/blobUtil';
import { queries } from '../../queries';

type MoveLayerRequestBody = {
  layerIndexes: LayerIndex[];
}

export type LayerIndex = {
  zIndex: number;
  layerId: string;
};

type MoveLayerResponseBody = {
  previewUrl: string;
}

export const moveLayerHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = await c.get("userId");
    const body = await c.req.json<MoveLayerRequestBody>();
    
    const firstLayerId: string = body.layerIndexes[0].layerId;

    const project = await queries.project.GetProjectFromLayerId(db, userId, firstLayerId)

    if (!project) return c.json({message: "not found"}, 404);

    console.log(body.layerIndexes)

    await queries.layer.UpdateLayerOrders(db, body.layerIndexes)

    const signer = makeSigner(c.env);

      const expiration = 60 * 2 // 2min;

      const previewUrl = makeObjectUrl(c.env, project.previewKey ?? "", expiration)

      const signedPreview = await signer.sign(
        new Request(previewUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/webp" },
        }),
        { aws: { signQuery: true } },
      );

      const signedPreviewUlr = signedPreview.url;

      const response: MoveLayerResponseBody = {
        previewUrl: signedPreviewUlr
      }

      return c.json(response, 200); 
  }
  catch (error) {
    console.error('Error moving layer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}