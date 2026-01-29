PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  latest_activity TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  preview_url TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  latest_activity TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS layer (
  id TEXT PRIMARY KEY,
  blob_url TEXT,
  project_id TEXT NOT NULL,
  name TEXT,
  width INTEGER,
  height INTEGER,
  length INTEGER,
  z_index INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES project(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_token (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  invalidated_at TEXT,
  token_hash TEXT NOT NULL,
  valid_to TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_user_id
  ON project(user_id);

CREATE INDEX IF NOT EXISTS idx_layer_project_id
  ON layer(project_id);

CREATE INDEX IF NOT EXISTS idx_layer_project_z
  ON layer(project_id, z_index);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id
  ON refresh_token(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_token_token_hash
  ON refresh_token(token_hash);