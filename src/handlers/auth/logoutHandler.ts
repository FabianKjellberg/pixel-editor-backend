import { Context } from "hono"
import { queries } from "../../queries";
import { getCookie, setCookie } from "hono/cookie";
import { hashSessionToken } from "../../util/authUtil";

export const logoutHandler = async (c: Context) => {
  try{
    const db = c.env.DB;
    
    const refreshToken = getCookie(c, 'refresh_token')

    if (!refreshToken){
      return c.json("no cookie found",400)
    }

    const hashedToken = await hashSessionToken(refreshToken, c.env.SESSION_SECRET);

    await queries.session.invalidateSession(db, hashedToken);

    const isProd = c.env.ENV === 'production'

    setCookie(c, 'refresh_token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      expires: new Date(0),
    })

    return c.json({message: "logout succesffully"},200);
  }
  catch (error){
    console.error('Error refreshing token:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}