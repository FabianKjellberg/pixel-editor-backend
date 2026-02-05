import { D1Database, D1PreparedStatement } from "@cloudflare/workers-types";
import { ProjectEntity, projectMapper, ProjectRow } from "../models/Project";
import { LayerEntity } from "../models/Layer";

type CreateProjectParams = {
  id: string,
  userId: string,
  name: string,
  previewKey: string,
  width: number,
  height: number,
}

export function CreateProjectStatement(
  db: D1Database, 
  params: CreateProjectParams
): D1PreparedStatement {
  return db
    .prepare(`
      INSERT INTO project (id, user_id, preview_key, name, width, height)
        VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      params.id,
      params.userId,
      params.previewKey,
      params.name,
      params.width,
      params.height
    )
}

export function CreateLayerStatement(
  db: D1Database, 
  params: LayerEntity
): D1PreparedStatement {
  return db
    .prepare(`
      INSERT INTO layer (id, blob_key, project_id, name, width, height, x, y, length, z_index)
        VALUES (?, ?, ?, ? ,? ,? ,?, ?, ?, ?)
    `)
    .bind(
      params.id,
      params.blobKey,
      params.projectId,
      params.name,
      params.width,
      params.height,
      params.x,
      params.y,
      params.length,
      params.zIndex
    )
}

export async function EnsureProjectExist(db: D1Database, projectId: string, userId: string){
  const project = await db
  .prepare(`
    SELECT id 
    FROM project 
    WHERE id = ?
    AND user_id = ? 
  `).bind(
    projectId,
    userId
  ).first();

  return !!project ? true : false;
}

export async function GetAllProjectsFromUserId(db: D1Database, userId: string): Promise<ProjectEntity[]>{
  const { results } = await db
    .prepare(`
      SELECT * FROM project
      WHERE user_id = ?
    `)
    .bind(userId)
    .all<ProjectRow>();

  return results 
    ? results.map((projectRow) => projectMapper.fromRow(projectRow)) 
    : [];
}