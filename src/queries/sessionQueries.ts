import { D1Database } from "@cloudflare/workers-types";

type CreateSessionParams = {
  sessionId: string;
  tokenId: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  sessionExpiresAt: string;
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