import { Hono } from 'hono'
import type { Bindings } from './env'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/test', (c) => {

  const result = c.env.DB.prepare('SELECT * FROM users').all();
  return c.json({ message: 'Hello Hono!', result })
})

export default app
