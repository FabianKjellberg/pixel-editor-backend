import { Context } from 'hono';
import { queries } from '../../queries';
import { AwsClient } from 'aws4fetch';
import { LayerEntity } from '../../models/Layer';
import { makeObjectUrl, makeSigner } from '../../util/blobUtil';

type ProjectRequestBody = {
  id: string;
  name: string;
  width: number;
  height: number;
}

type LayerRequestBody = {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  length: number;
}

type CreateProjectRequestBody = {
  project: ProjectRequestBody;
  layers: LayerRequestBody[];
}

export const createProjectHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = await c.get('userId');

    const body = await c.req.json<CreateProjectRequestBody>();

    // ensure project isnt already created
    const projAlreadyExists: boolean = await queries.project.EnsureProjectExist(db, body.project.id, userId);

    if(projAlreadyExists) {
      return c.json("project already exists", 409)
    }

    //mapping
    const previewExt: string = 'webp' 
    const previewKey: string = `users/${userId}/projects/${body.project.id}/preview.${previewExt}`

    const layerExt: string = 'bin'
    const mappedLayers: LayerEntity[] = body.layers.map((layer) => {
      const layerKey = `users/${userId}/projects/${body.project.id}/layers/${layer.id}.${layerExt}`

      return {
        id: layer.id,
        blobKey: layerKey,
        projectId: body.project.id,
        name: layer.name,
        width: layer.width,
        height: layer.height,
        x: layer.x,
        y: layer.y,
        length: layer.length,
        zIndex: layer.zIndex
      }
    })

    //sign preview
    const signer = makeSigner(c.env);
    const expiration = 60 * 2 //2 min
    const previewUrl = makeObjectUrl(c.env, previewKey, expiration);

    const signedPreview = await signer.sign(
      new Request(previewUrl,{
        method: 'PUT',
        headers: { "Content-Type": "image/webp"},
      })
    )

    const layerSigned = await Promise.all(
      mappedLayers.map(async (layer) => {
        const url = makeObjectUrl(c.env, layer.blobKey, expiration);

        const signed = await signer.sign(url,{
          method: 'PUT',
          headers: {"Content-Type": "application/octet-stream"}
        })

        return {
          layerId: layer.id,
          key: layer.blobKey,
          uploadUrl: signed.url,
          headers: {"Content-Type": "application/octet-stream"}
        }
      })
    )

    //upload to tables
    const preparedBatchStatement = [
      queries.project.CreateProjectStatement(db, {
      id: body.project.id,
      userId: userId,
      name: body.project.name,
      previewKey: previewKey,
      width: body.project.width,
      height: body.project.height
    }),
      ...mappedLayers.map((layer) => {
        return queries.project.CreateLayerStatement(db, layer)
      })
    ]

    await db.batch(preparedBatchStatement);

    return c.json({
      projectId: body.project.id,
      preview: {
        key: previewKey,
        uploadUrl: signedPreview.url,
        headers: { "Content-Type": "image/webp"},
      },
      layers: layerSigned,
      expiration: expiration
    },200)
  }
  catch (error){
    console.error('Error creating project:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}