import { Context } from 'hono'
import { queries } from '../../queries'
import { makeObjectUrl, makeSigner } from '../../util/blobUtil'

type DeleteLayerRequestBody = {
  layerId: string,
  shouldPreview: boolean,
}

type DeleteLayerResponseBody = {
  previewUrl: string
}

export const deleteLayerHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = await c.get("userId");
    const body = await c.req.json<DeleteLayerRequestBody>();

    const layer = await queries.layer.GetLayerFromLayerId(db, body.layerId);

    if (!layer) return c.json({message: "not found"}, 404);

    const project = await queries.project.GetProjectFromProjectId(db, userId, layer.projectId);

    if (!project) return c.json({message: "not found"}, 404);

    await c.env.BLOB.delete(layer.blobKey);

    await queries.layer.DeleteLayerFromId(db, layer.id);
    
    let signedPreviewUlr = "";

    if (body.shouldPreview){
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

      signedPreviewUlr = signedPreview.url;
    }

    const responseBody: DeleteLayerResponseBody = {
      previewUrl: signedPreviewUlr
    }
     
    return c.json(responseBody, 200);
  }
  catch (error) {
    console.error('Error deleting layer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
} 