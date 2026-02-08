import { Context } from 'hono';
import { ProjectEntity } from '../../models/Project';
import { LayerEntity } from '../../models/Layer';
import { queries } from '../../queries';
import { makeObjectUrl, makeSigner } from '../../util/blobUtil';

type ProjectBody = {
  id: string,
  name: string,
  createdAt: Date,
  latestActivity: Date | null;
  width: number;
  height: number;
}

type LayerBody = {
  id: string;
  name: string;
  signedBlobUrl: string;
  width: number;
  height: number;
  x: number;
  y:number;
  zIndex: number;
}

type ReponseBody = {
  project: ProjectBody;
  layers: LayerBody[];
}

export const getProjectHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = c.get("userId");
    const projectId = c.req.param('id')

    const signer = makeSigner(c.env);

    const project: ProjectEntity | null = 
      await queries.project.GetProjectFromProjectId(db, userId, projectId);

    if(!project){
      return c.json({message: "project not found"}, 404)
    }

    const projectBody: ProjectBody = {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      latestActivity: project.latestActivity,
      width: project.width,
      height: project.height,
    }

    const layers: LayerEntity[] = 
      await queries.layer.GetLayersFromProjectId(db, projectId);

    const layerBodies: LayerBody[] = 
      await Promise.all(layers.map(async (layer) => {
        const url = makeObjectUrl(c.env, layer.blobKey, 180);

        const signedUrl = await signer.sign(
          new Request(url, {method: "GET"}),
          {aws: {signQuery: true}}
        );

        return {
          id: layer.id,
          name: layer.name,
          signedBlobUrl: signedUrl.url,
          width: layer.width,
          height: layer.height,
          x: layer.x,
          y: layer.y,
          zIndex: layer.zIndex,
        }
    }))

    const responseBody: ReponseBody = {
      project: projectBody,
      layers: layerBodies,
    }

    return c.json(responseBody , 200);
  }
  catch(error) {
    console.error("Error creating project:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};