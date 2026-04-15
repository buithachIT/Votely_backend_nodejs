import express, { Router } from 'express';
import {
  createUser,
  handleLogin,
  handleRefreshToken,
  getCurrentUser,
  handleLogout,
} from '../controllers/user.controller';
import {
  loginLimiter,
  registerLimiter,
  authMiddleware,
} from '../middlewares/rateLimiter';
import { validateBody } from '@/middlewares/validation.middleware';
import { loginSchema, registerSchema } from '@/schema/user.schema';

const routerAPI: Router = express.Router();

routerAPI.post(
  '/register',
  registerLimiter,
  validateBody(registerSchema),
  createUser,
);
routerAPI.post('/login', loginLimiter, validateBody(loginSchema), handleLogin);
routerAPI.post('/refresh', handleRefreshToken);
routerAPI.get('/me', authMiddleware, getCurrentUser);
routerAPI.post('/logout', authMiddleware, handleLogout);

export default routerAPI;
