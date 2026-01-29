import { D1Database } from "@cloudflare/workers-types"

type createUserParams = {
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
export async function createUser(db: D1Database, user: createUserParams): Promise<void> {
  await db
    .prepare(`
      INSERT INTO users (id, username, password_hash) 
      VALUES (?, ?, ?)
    `)
    .bind(user.id, user.username, user.passwordHash)
    .run();
}