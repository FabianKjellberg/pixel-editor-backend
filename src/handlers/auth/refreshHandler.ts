import { Context } from 'hono'
import { getCookie, setCookie } from 'hono/cookie';
import { queries } from '../../queries';
import { createAccessToken, generateSessionToken, hashSessionToken } from '../../util/authUtil';

export const refreshHandler = async (c: Context) => {
  try{
    const refreshToken = getCookie(c, 'refresh_token')

    if(!refreshToken){
      return c.json({message: "no refreshToken found, unauthorized"}, 401)
    }

    const db = c.env.DB
    const sessionSecret = c.env.SESSION_SECRET;
    const hashedToken = await hashSessionToken(refreshToken, sessionSecret);

    const session = await queries.session.getSessionFromToken(db, hashedToken);

    if (session == null){
      return c.json({message: "no valid refreshToken found, unauthorized"}, 401)
    }

    const newRefreshToken = generateSessionToken();
    const newHashedToken = await hashSessionToken(newRefreshToken, c.env.SESSION_SECRET);

    await queries.session.rotateToken(db, {
      tokenId: crypto.randomUUID(),
      sessionId: session.id,
      oldHashedToken: hashedToken,
      newHashedToken: newHashedToken,
      now: new Date().toISOString(),
      tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days;
    });

    const isProd = c.env.ENV === 'production'

    setCookie(c, 'refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    })

    const accessToken = await createAccessToken(session.userId, c.env.JWT_SECRET);

    return c.json({message: "refreshed succesfull", accessToken: accessToken}, 200)
  }
  catch (error){
    console.error('Error refreshing token:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}