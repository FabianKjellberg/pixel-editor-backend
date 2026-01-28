import { Hono } from 'hono'
import type { Bindings } from './env'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/test', async (c) => {
  try {
    const result = await c.env.DB
      .prepare('SELECT * FROM users')
      .all()
    console.log('Query result:', result)
    return c.json({
      message: 'Hello Hono!',
      result
    })
  } catch (error) {
    console.error('DB error:', error)
    return c.text('Internal Server Error', 500)
  }
})

export default app
