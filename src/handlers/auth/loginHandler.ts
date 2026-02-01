import { Context } from "hono"
import { queries } from "../../queries";
import bcrypt from "bcryptjs";
import { createAccessToken, generateSessionToken, hashSessionToken } from "../../util/authUtil";
import { setCookie } from "hono/cookie";

type LoginBody = {
  username: string;
  password: string;
}

export const loginHandler = async (c: Context) => {
  try {
    const body = await c.req.json<LoginBody>();

    const db = c.env.DB;

    const user = await queries.users.getUserByUsername(db, body.username)

    // return identical error response for password and username
    if (!user) {
      return c.json({ error: 'invalid credentials' }, 401)
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash)

    // return identical error response for password and username
    if (!isPasswordValid) {
      return c.json({ error: 'invalid credentials' }, 401)
    }

    const token = generateSessionToken();

    const hashedToken = await hashSessionToken(token, c.env.SESSION_SECRET);

    await queries.session.createRefreshSessionWithToken(db, {
      sessionId: crypto.randomUUID(),
      tokenId: crypto.randomUUID(),
      userId: user.id,
      tokenHash: hashedToken,
      sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
      tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
    })

    const isProd = c.env.ENV === 'production'

    setCookie(c, 'refresh_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    })

    const accessToken = await createAccessToken(user.id, c.env.JWT_SECRET);

    return c.json({ message: 'successfully logged in', accessToken: accessToken}, 200)
  }
  catch (error) {
    console.error('Error logging in:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}