import { Hono } from 'hono'
import { loginHandler } from '../handlers/auth/loginHandler'
import { registerHandler } from '../handlers/auth/registerHandler'
import { logoutHandler } from '../handlers/auth/logoutHandler'
import { refreshHandler } from '../handlers/auth/refreshHandler'

import { authMiddleware } from '../middlewares/authMiddleware'
import { testAuthHandler } from '../handlers/auth/testAuthHandler'

const authRoutes = new Hono();

// Test auth
authRoutes.get('/test-auth', authMiddleware, testAuthHandler)

// Login route
authRoutes.post('/login', loginHandler);

// Register route
authRoutes.post('/register', registerHandler);

// Logout route
authRoutes.post('/logout', authMiddleware, logoutHandler);

// Refresh route
authRoutes.post('/refresh', refreshHandler);

export default authRoutes;