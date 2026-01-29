PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS refresh_token;
DROP TABLE IF EXISTS refresh_session;
DROP TABLE IF EXISTS layer;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  latest_activity TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE project (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  preview_key TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  latest_activity TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE layer (
  id TEXT PRIMARY KEY,
  blob_key TEXT,
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

CREATE TABLE refresh_session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  invalidated_at TEXT,
  valid_to TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE refresh_token (
  id TEXT PRIMARY KEY,
  refresh_session_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  invalidated_at TEXT,
  valid_to TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (refresh_session_id) REFERENCES refresh_session(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_project_user_id ON project(user_id);
CREATE INDEX idx_layer_project_id ON layer(project_id);
CREATE INDEX idx_layer_project_z ON layer(project_id, z_index);

CREATE INDEX idx_refresh_session_user_id ON refresh_session(user_id);
CREATE INDEX idx_refresh_token_session_id ON refresh_token(refresh_session_id);

CREATE UNIQUE INDEX uq_refresh_token_token_hash ON refresh_token(token_hash);
