import { D1Database } from "@cloudflare/workers-types"
import { UserEntity, userMapper, UserRow } from "../models/User";

type CreateUserParams = {
  id: string;
  username: string;
  passwordHash: string;
}

/**
 * checks if a username exists in the database
 * @param db - the database connection
 * @param username - the username to check
 * @returns true if the username exists, false otherwise
 */
export async function usernameExists(db: D1Database, username: string): Promise<boolean> {
  const result = await db.prepare(`
    SELECT * FROM users 
    WHERE username = ?
  `).bind(username).first();

  return result !== null;
}

/** 
 * creates a new user in the database
 * @param db - the database connection
 * @param user - the user to create
 */
export async function createUser(db: D1Database, user: CreateUserParams): Promise<void> {
  await db
    .prepare(`
      INSERT INTO users (id, username, password_hash) 
      VALUES (?, ?, ?)
    `)
    .bind(user.id, user.username, user.passwordHash)
    .run();
}

/**
 * get user entity from username
 * @param db - the database connection
 * @param username - the username to get the user for
 * @returns the user entity if found, null otherwise
 */
export async function getUserByUsername(db: D1Database, username: string): Promise<UserEntity | null> {
  const result = await db
    .prepare(`
      SELECT * FROM users
      WHERE username = ?
    `)
    .bind(username)
    .first<UserRow>();

  if (result === null) {
    return null;
  }

  const user: UserEntity = userMapper.fromRow(result);

  return user;
}

/**
 * get user entity from userId
 * @param db - the database connection
 * @param userId - the userId to get the user for
 * @returns the user entity if found, null otherwise
 */
export async function getUserById(db: D1Database, userId: string): Promise<UserEntity | null> {
  const result = await db
    .prepare(`
      SELECT * FROM users
      WHERE id = ?
    `)
    .bind(userId)
    .first<UserRow>();

  if (result === null) {
    return null;
  }

  const user: UserEntity = userMapper.fromRow(result);

  return user;
}