import { Context } from 'hono';
import { queries } from '../../queries';
import { ProjectEntity } from '../../models/Project';
import { makeObjectUrl, makeSigner } from '../../util/blobUtil';

export const getMyProjectPreviewsHandler = async (c: Context) => {
  try {
    const db = c.env.DB;
    const userId = c.get("userId");

    const signer = makeSigner(c.env);

    const projects: ProjectEntity[] = await queries.project.GetAllProjectsFromUserId(db, userId);

    const responseBody = await Promise.all(projects.map(async (project) => {
      if (!project.previewKey) {
        return {
          signedPreviewUrl: null,
          id: project.id,
          latestActivity: project.latestActivity,
          createdAt: project.createdAt,
          name: project.name,
        };
      }

      const url = makeObjectUrl(c.env, project.previewKey, 180)
      
      const signedUrl = await signer.sign(
        new Request(url, { method: "GET" }),
        { aws: { signQuery: true } }
      );

      return {
        signedPreviewUrl: signedUrl.url,
        id: project.id,
        latestActivity: project.latestActivity,
        createdAt: project.createdAt,
        name: project.name
      }
    }))

    return c.json(responseBody, 200)
  }
  catch(error){   
    console.error("Error creating project:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}