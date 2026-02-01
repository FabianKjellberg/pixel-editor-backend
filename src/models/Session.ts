import { UserEntity } from "./User";

export type SessionEntity = {
  id: string;
  userId: string;
  invalidatedAt: Date | null;
  validTo: Date;
  createdAt: Date;
}

export type SessionRow = {
  id: string;
  user_id: string;
  invalidated_at: string | null;
  valid_to: string;
  created_at: string;
}

export const sessionMapper = {
  fromRow: (session: SessionRow): SessionEntity => {
    return {
      id: session.id,
      userId: session.user_id,
      invalidatedAt: session.invalidated_at
        ? new Date(session.invalidated_at)
        : null,
      validTo: new Date(session.valid_to),
      createdAt: new Date(session.created_at),
    }
  },

  toRow: (session: SessionEntity): SessionRow => {
    return {
      id: session.id,
      user_id: session.userId,
      invalidated_at: session.invalidatedAt
        ? session.invalidatedAt.toISOString()
        : null,
      valid_to: session.validTo.toISOString(),
      created_at: session.createdAt.toISOString(),
    }
  }
}
