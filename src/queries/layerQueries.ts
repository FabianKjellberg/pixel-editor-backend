import { D1Database, D1PreparedStatement } from "@cloudflare/workers-types";
import { LayerEntity, layerMapper, LayerMetaData, LayerRow } from "../models/Layer";
import { LayerIndex } from "../handlers/layer/moveLayerHandler";

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

export async function CreateLayer(
  db: D1Database, 
  params: LayerEntity
): Promise<void> {
  await db
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
    ).run();
}

export async function GetLayersFromProjectId(db: D1Database, projectId: string): Promise<LayerEntity[]> {
  const { results } = await db
    .prepare(`
      SELECT * FROM layer
      WHERE project_id = ?
    `)
    .bind(projectId)
    .all<LayerRow>()

  return results.map((layer) => layerMapper.fromRow(layer));
}

export async function UpdateLayerMetadata(db: D1Database, metadata: LayerMetaData): Promise<void>{
  await db
    .prepare(`
      UPDATE layer
      SET x = ?, y = ?, width = ?, height = ?, length = ?
      WHERE id = ?
    `)
    .bind(
      metadata.x,
      metadata.y,
      metadata.width,
      metadata.height,
      metadata.length,
      metadata.layerId
    )
    .run();
}

export async function GetLayerFromLayerId(db: D1Database, layerId: string): Promise<LayerEntity | null> {
  const results = await db
    .prepare(`
      SELECT * FROM layer
      WHERE id = ?
    `)
    .bind(layerId)
    .first<LayerRow>()

  return results ? layerMapper.fromRow(results) : null;
}

export async function DeleteLayerFromId(db: D1Database, layerId: string): Promise<void> {
  await db
    .prepare(`
      DELETE FROM layer
      WHERE id = ?
    `)
    .bind(layerId)
    .run();
}

export async function UpdateLayerName(db: D1Database, layerId: string, name: string): Promise<void> {
  await db
    .prepare(`
      UPDATE layer
      SET name = ?
      WHERE id = ?
    `)
    .bind(name, layerId)
    .run();
}

export async function UpdateLayerOrders(db: D1Database, layerIndexes: LayerIndex[]): Promise<void> {
  if (layerIndexes.length === 0) return;

  const statements = layerIndexes.map(({ layerId, zIndex }) =>
    db
      .prepare(`
        UPDATE layer 
        SET z_index = ? 
        WHERE id = ?
      `)
      .bind(zIndex, layerId),
  );

  await db.batch(statements);
}

export async function PushLayerIndexesDown(db: D1Database, projectId: string, index: number) : Promise<void> {
  await db
    .prepare(`
      UPDATE layer
      SET z_index = z_index + 1
      WHERE project_id = ?
        AND z_index >= ?
    `)
    .bind(projectId, index)
    .run();
}