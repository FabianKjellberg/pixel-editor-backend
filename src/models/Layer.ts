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

export type LayerMetaData = {
  layerId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  length: number,
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
  },
  compareMetadata: (layer: LayerEntity, metadata: LayerMetaData): boolean => {
    return metadata.height === layer.height 
    && metadata.width === layer.width
    && metadata.x === layer.x
    && metadata.y === layer.y
    && metadata.length === layer.length
  }
}