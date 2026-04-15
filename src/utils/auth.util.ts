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

  const accessToken = jwt.sign({ sub: userId }, accessTokenSecret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ sub: userId }, refreshTokenSecret!, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};
