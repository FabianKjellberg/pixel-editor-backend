import { Hono } from 'hono'
import type { Bindings } from './env'
import authRoutes from './routes/authRoutes'
import { cors } from 'hono/cors'
import userRoutes from './routes/userRoutes'
import projectRoutes from './routes/projectRoutes'
import layerRoutes from './routes/layerRoutes'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: ['https://fabiankjellberg.dev', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.route('/auth', authRoutes)
app.route('/user', userRoutes)
app.route('/project', projectRoutes)
app.route('/layer', layerRoutes)

export default app
