export type ProjectEntity = {
  id: string;
  userId: string;
  name: string;
  previewKey: string | null;
  createdAt: Date
  latestActivity: Date | null;
  width: number;
  height: number; 
}
export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  preview_key: string | null;
  created_at: string
  latest_activity: string | null;
  width: number;
  height: number; 
}

export const projectMapper = {
  fromRow: (project: ProjectRow): ProjectEntity => {
    return {
      id: project.id,
      userId: project.user_id,
      name: project.name,
      previewKey: project.preview_key,
      createdAt: new Date(project.created_at),
      latestActivity: project.latest_activity 
        ? new Date(project.latest_activity)
        : null,
      width: project.width,
      height: project.height
    }
  },
  toRow: (project: ProjectEntity): ProjectRow => {
    return {
      id: project.id,
      user_id: project.userId,
      name: project.name,
      preview_key: project.previewKey,
      created_at: project.createdAt.toISOString(),
      latest_activity: project.latestActivity 
        ? project.latestActivity.toISOString()
        : null,
      width: project.width,
      height: project.height
    }
  }
}