export type LayerEntity = {
  id: string;
  blobKey: string;
  projectId: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  length: number;
  zIndex: number; 
}
export type LayerRow = {
  id: string;
  blob_key: string;
  project_id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  length: number;
  z_index: number; 
}

export const layerMapper = {
  fromRow: (layer: LayerRow): LayerEntity => {
    return {
      id: layer.id,
      blobKey: layer.blob_key,
      projectId: layer.project_id,
      name: layer.name,
      width: layer.width,
      height: layer.height,
      x: layer.x,
      y: layer.y,
      length: layer.length,
      zIndex: layer.z_index
    }
  },
  toRow: (layer: LayerEntity): LayerRow => {
    return {
      id: layer.id,
      blob_key: layer.blobKey,
      project_id: layer.projectId,
      name: layer.name,
      width: layer.width,
      height: layer.height,
      x: layer.x,
      y: layer.y,
      length: layer.length,
      z_index: layer.zIndex
    }
  }
}