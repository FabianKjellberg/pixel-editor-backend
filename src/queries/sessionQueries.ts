import { D1Database } from "@cloudflare/workers-types";
import { SessionEntity, sessionMapper, SessionRow } from "../models/Session";

type CreateSessionParams = {
  sessionId: string;
  tokenId: string;
  userId: string;
  tokenHash: string;
  sessionExpiresAt: string;
  tokenExpiresAt: string;
}

type RotateTokenParams = {
  tokenId: string;
  sessionId: string;
  oldHashedToken: string;
  newHashedToken: string;
  now: string;
  tokenExpiresAt: string;
}

export async function createRefreshSessionWithToken(db: D1Database, session: CreateSessionParams): Promise<void> {
  await db
    .prepare(`
      INSERT INTO refresh_session (id, user_id, valid_to)
        VALUES (?, ?, ?)
    `)
    .bind(
      session.sessionId,
      session.userId,
      session.sessionExpiresAt,
    )
    .run();

  await db
    .prepare(`
      INSERT INTO refresh_token (id, refresh_session_id, token_hash, valid_to)
        VALUES (?, ?, ?, ?)
    `)
    .bind(
      session.tokenId,
      session.sessionId,
      session.tokenHash,
      session.tokenExpiresAt,
    )
    .run();
}

export async function getSessionFromToken(db: D1Database, tokenHash: string): Promise<SessionEntity | null> {
  const session = await db
  .prepare(`
    SELECT rs.* FROM refresh_session as rs
    JOIN refresh_token as rt
      ON rt.refresh_session_id == rs.id
    WHERE rt.token_hash = ?
    AND rt.invalidated_at IS NULL
  `)
  .bind(tokenHash)
  .first<SessionRow>();

  if(session == null) return null;

  const sessionEntity : SessionEntity = sessionMapper.fromRow(session);

  const isExpired = sessionEntity.validTo.getTime() <= Date.now();

  if (isExpired) {
    return null;
  }

  return sessionEntity;
}

export async function rotateToken(db: D1Database, params: RotateTokenParams): Promise<void> {
  await db
    .prepare(`
      UPDATE refresh_token
      SET invalidated_at = ?
      WHERE token_hash = ?  
    `)
    .bind(params.now, params.oldHashedToken)
    .run();

  await db
    .prepare(`
      INSERT INTO refresh_token (id, refresh_session_id, token_hash, valid_to)
        VALUES (?, ?, ?, ?) 
    `)
    .bind(
      params.tokenId,
      params.sessionId,
      params.newHashedToken,
      params.tokenExpiresAt,
    )
    .run();
}
