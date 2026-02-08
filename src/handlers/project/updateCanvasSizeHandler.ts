import { Context } from "hono"
import { queries } from "../../queries"
import { makeObjectUrl, makeSigner } from "../../util/blobUtil"

type UpdateCanvasSizeRequestBody = {
  width: number, 
  height: number, 
  projectId: string,
}

type UpdateCanvasDimensionResponseBody = {
  previewUrl: string
}
export const updateCanvasSizeHandler = async (c: Context) => {
  try{
    const db = c.env.DB;
    const userId = await c.get("userId");
    const body = await c.req.json<UpdateCanvasSizeRequestBody>();

    const project = await queries.project.GetProjectFromProjectId(db, userId, body.projectId);

    if(!project) return c.json({message: "not found"}, 404);

    await queries.project.UpdateProjectDimensions(db, body.width, body.height, body.projectId);
        
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

      const response: UpdateCanvasDimensionResponseBody = {
        previewUrl: signedPreviewUlr
      }

      return c.json(response, 200); 
  }
  catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}