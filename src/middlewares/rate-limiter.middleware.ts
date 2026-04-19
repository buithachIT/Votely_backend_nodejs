import rateLimit from 'express-rate-limit';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendError } from '../helpers/response.helper';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Quá nhiều lần đăng ký, vui lòng thử lại sau.',
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
        message: 'Yêu cầu token truy cập',
        statusCode: 401,
      });
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      return sendError(res, {
        message: 'Cấu hình server không hợp lệ',
        statusCode: 500,
      });
    }

    const decoded = jwt.verify(token, jwtSecretKey) as JwtPayload;
    req.user = {
      _id: new mongoose.Types.ObjectId(decoded.sub as string),
    };
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      return sendError(res, {
        message: 'Token đã hết hạn',
        statusCode: 401,
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, {
        message: 'Token không hợp lệ',
        statusCode: 401,
      });
    }
    sendError(res, {
      message: 'Xác thực thất bại do lỗi hệ thống',
      statusCode: 401,
    });
  }
};

export { apiLimiter, loginLimiter, registerLimiter, authMiddleware };
