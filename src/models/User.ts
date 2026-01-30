export type UserEntity = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string | null;
}

export type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string | null;
}

export const userMapper = {
  fromRow: (user: UserRow): UserEntity => {
    return {
      id: user.id,
      username: user.username,
      passwordHash: user.password_hash,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }
  },
  toRow: (user: UserEntity): UserRow => {
    return {
      id: user.id,
      username: user.username,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }
  }
}