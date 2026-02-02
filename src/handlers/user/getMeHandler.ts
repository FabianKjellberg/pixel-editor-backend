import {Context} from 'hono';
import { queries } from '../../queries';

export const getMeHandler = async (c: Context) => {
  try{
    const db = c.env.DB;
    const userId = await c.get('userId')

    const user = await queries.users.getUserById(db, userId);

    return c.json({
      userId: user?.id, 
      username: user?.username, 
      createdAt: user?.createdAt, 
      latestActivity: user?.updatedAt ?? null
    },200)
  }  
  catch (error) {
    console.error('Error logging in:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}