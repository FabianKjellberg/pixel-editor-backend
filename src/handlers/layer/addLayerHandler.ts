import { Context } from 'hono';
import { makeObjectUrl, makeSigner } from '../../util/blobUtil';
import { queries } from '../../queries';
import { LayerEntity } from '../../models/Layer';

type AddLayerRequestBody = {
  projectId : string;
  length: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  layerId: string;
  name: string;
}

type AddLayerResponseBody = {
  layerUrL: string;
  previewUrl: string;
}

export const addLayerHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = await c.get("userId");
    const body = await c.req.json<AddLayerRequestBody>()

    const project = await queries.project.GetProjectFromProjectId(db, userId, body.projectId);

    if (!project) return c.json({message: "not found"}, 404)

    if (body.zIndex) {
      await queries.layer.PushLayerIndexesDown(db, project.id, body.zIndex);
    }

    const realZIndex: number = body.zIndex ? body.zIndex : await queries.project.GetLayerCount(db, project.id);

    const layerExt: string = "bin";
    const blobKey = `users/${userId}/projects/${project.id}/layers/${body.layerId}.${layerExt}`

    await c.env.BLOB.put(blobKey, new Uint8Array(0), {
      httpMetadata: { contentType: 'application/octet-stream' },
    });

    const layer: LayerEntity = {
      id: body.layerId,
      blobKey,
      projectId: project.id,
      name: body.name,
      width: body.width,
      height: body.height,
      x: body.x,
      y: body.y,
      length: body.length,
      zIndex: realZIndex,
    }

    await queries.layer.CreateLayer(db, layer)

    let signedPreviewUlr = ""

    const shouldPreview = body.width > 0 && body.height > 0;

    const signer = makeSigner(c.env);
    const expiration = 60 * 2 // 2min;

    if (shouldPreview){
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

    const layerUrl = makeObjectUrl(c.env, layer.blobKey, expiration);

    const signedLayer = await signer.sign(
      new Request(layerUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
      }),
      { aws: { signQuery: true } },
    );

    const signedLayerUrl = signedLayer.url

    const responseBody: AddLayerResponseBody = {
      previewUrl: signedPreviewUlr,
      layerUrL: signedLayerUrl
    }

    return c.json(responseBody, 200);
  }
  catch (error) {
    console.error('Error adding layer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}