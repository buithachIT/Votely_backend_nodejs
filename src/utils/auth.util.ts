import crypto from 'crypto';
import { AppError } from './app-error.util';
import jwt from 'jsonwebtoken';

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateTokens = (userId: string) => {
  const accessTokenSecret = process.env.JWT_SECRET_KEY;
  const refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || accessTokenSecret;

  if (!accessTokenSecret) {
    throw new AppError('Missing JWT_SECRET_KEY', 500);
  }

  // Dev: 30 seconds for easy testing, Prod: 15m
  const accessTokenExpiry =
    process.env.NODE_ENV === 'production' ? '15m' : '7d';

  const accessToken = jwt.sign({ sub: userId }, accessTokenSecret, {
    expiresIn: accessTokenExpiry,
  });

  const refreshToken = jwt.sign({ sub: userId }, refreshTokenSecret!, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};
