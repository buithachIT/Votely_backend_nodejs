import express, { Router } from 'express';
import {
  createUser,
  handleLogin,
  handleRefreshToken,
  getCurrentUser,
  handleLogout,
} from '../controllers/user.controller';
import {
  createPoll,
  getPollByCode,
  getPollById,
  getUserPolls,
  updatePoll,
  closePoll,
  deletePoll,
  votePoll,
} from '../controllers/poll.controller';
import { getChatHistory } from '../controllers/chat.controller';
import {
  loginLimiter,
  registerLimiter,
  authMiddleware,
} from '../middlewares/rate-limiter.middleware';
import { validateBody } from '@/middlewares/validation.middleware';
import { loginSchema, registerSchema } from '@/schema/user.schema';

const routerAPI: Router = express.Router();

routerAPI.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Server is running',
    instructions: {
      step1: '1. POST to /login with { email, password }',
      step2: '2. Copy the accessToken from response',
      step3: '3. Click the Authorize (🔒) button in Swagger UI',
      step4: '4. Paste token in format: Bearer <token>',
      step5: '5. Now you can test protected endpoints!',
    },
  });
});

// User routes
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

// Poll routes
routerAPI.post('/polls', authMiddleware, createPoll);
routerAPI.get('/polls/code/:code', getPollByCode);
routerAPI.get('/polls/:id', getPollById);
routerAPI.get('/my-polls', authMiddleware, getUserPolls);
routerAPI.patch('/polls/:id', authMiddleware, updatePoll);
routerAPI.patch('/polls/:id/close', authMiddleware, closePoll);
routerAPI.delete('/polls/:id', authMiddleware, deletePoll);
routerAPI.post('/polls/:id/vote', authMiddleware, votePoll);
routerAPI.get('/polls/chat/:pollCode', getChatHistory);

export default routerAPI;
