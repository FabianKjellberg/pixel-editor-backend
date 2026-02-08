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

export async function GetProjectFromProjectId(db: D1Database, userId: string, projectId: string): Promise<ProjectEntity | null> {
  const results = await db
    .prepare(`
      SELECT * FROM project
      WHERE user_id = ?
      AND id = ?
    `)
    .bind(userId, projectId)
    .first<ProjectRow>()

    return results ? projectMapper.fromRow(results) : null;
}

export async function GetProjectFromLayerId(db: D1Database, userId: string, layerId: string) {
  const project = await db
    .prepare(`
      SELECT p.* FROM project as p
      JOIN layer as l 
        ON l.project_id = p.id
      WHERE l.id = ?
      AND p.user_id = ? 
    `)
    .bind(layerId, userId)
    .first<ProjectRow>();

  return project ? projectMapper.fromRow(project) : null;
}

export async function GetLayerCount(db: D1Database, projectId: string): Promise<number>{
  const row = await db
  .prepare(`
    SELECT COUNT(*)
    FROM layer
    WHERE project_id = ?
  `)
  .bind(projectId)
  .first<{count: number}>()
  
  return row?.count ? row.count : 0;
}

export async function UpdateProjectDimensions(db: D1Database, width: number, height: number, projectId: string): Promise<void>{
  await db
    .prepare(`
      UPDATE project
      SET width = ?, height = ?
      WHERE id = ?
    `)
    .bind(
      width, 
      height, 
      projectId
    )
    .run();
}