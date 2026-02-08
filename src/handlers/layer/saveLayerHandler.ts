import { Context } from 'hono'
import { queries } from '../../queries';
import { ProjectEntity } from '../../models/Project';
import { LayerEntity, layerMapper, LayerMetaData } from '../../models/Layer';
import { makeObjectUrl, makeSigner } from '../../util/blobUtil';

type SaveLayerRequestBody = {
  layerId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  length: number,
}

type SaveLayerResponse = {
  previewUrl: string,
  layerUrl: string,
}

export const saveLayerHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = await c.get("userId");
    const body = await c.req.json<SaveLayerRequestBody>();

    const layer: LayerEntity | null = 
      await queries.layer.GetLayerFromLayerId(db, body.layerId);
    
    const project: ProjectEntity | null = 
      await queries.project.GetProjectFromLayerId(db, userId, body.layerId);

    if (!project?.previewKey || !layer?.blobKey) return c.json("not found", 404);

    if(!layerMapper.compareMetadata(layer, body)){
      await queries.layer.UpdateLayerMetadata(db, body as LayerMetaData);
    }

    const signer = makeSigner(c.env);    

    const expiration = 60 * 2 // 2min

    const previewUrl = makeObjectUrl(c.env, project.previewKey, expiration);
    const previewSigned = await signer.sign(
      new Request(previewUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
      }),
      {aws: {signQuery: true}}
    )

    const layerUrl = makeObjectUrl(c.env, layer.blobKey, expiration);
    const layerSigned = await signer.sign(
      new Request(layerUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
      }),
      {aws: {signQuery: true}}
    )

    const responseBody: SaveLayerResponse = {
      previewUrl: previewSigned.url,
      layerUrl: layerSigned.url
    }

    return c.json(responseBody, 200)
  }
  catch (error) {
    console.error("Error creating project:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}