import rateLimit from 'express-rate-limit';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../helpers/response.helper';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Too many requests, please try later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Too many registration attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, {
        message: 'Access token is required',
        statusCode: 401,
      });
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      return sendError(res, {
        message: 'Server misconfiguration',
        statusCode: 500,
      });
    }

    const decoded = jwt.verify(token, jwtSecretKey) as JwtPayload;
    req.userId = decoded.sub as string;
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      return sendError(res, {
        message: 'Token expired',
        statusCode: 401,
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, {
        message: 'Invalid token',
        statusCode: 401,
      });
    }
    sendError(res, {
      message: 'Authentication failed',
      statusCode: 401,
    });
  }
};

export { apiLimiter, loginLimiter, registerLimiter, authMiddleware };
