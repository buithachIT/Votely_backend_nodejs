import { isMongoError } from '@/utils/type-guards.util';
import User from '../models/user.model';
import RefreshToken from '../models/refresh-token.model';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '@/utils/app-error.util';
import { EXPIRED_TOKEN } from '@/config/expired-jwt';
import { generateTokens, hashToken } from '@/utils/auth.util';

export const createUserService = async (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string,
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: hashedPassword,
    });
    return result;
  } catch (error: unknown) {
    if (isMongoError(error) && error.code === 11000) {
      throw new AppError('Email đã tồn tại', 400);
    }
    throw error;
  }
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password || ''))) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  await RefreshToken.create({
    tokenHash: hashToken(refreshToken),
    userId: user._id,
    expiresAt: new Date(Date.now() + EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN),
  });

  return { accessToken, refreshToken, user };
};

export const refreshTokenService = async (refreshToken: string) => {
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY;

  if (!refreshSecret) {
    throw new AppError('Server configuration missing secret keys', 500);
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
    const userId = decoded.sub as string;

    const stored = await RefreshToken.findOneAndDelete({
      tokenHash: hashToken(refreshToken),
      userId,
    });
    if (!stored) {
      throw new AppError('Phiên làm việc không hợp lệ hoặc đã bị thu hồi', 401);
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('Tài khoản không tồn tại hoặc bị khóa', 404);

    const tokens = generateTokens(user.id);

    await RefreshToken.create({
      tokenHash: hashToken(tokens.refreshToken),
      userId: user._id,
      expiresAt: new Date(Date.now() + EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN),
    });

    return {
      ...tokens,
      user: user.toObject(),
    };
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError)
      throw new AppError('Phiên đăng nhập hết hạn', 401);
    if (error instanceof jwt.JsonWebTokenError)
      throw new AppError('Token không hợp lệ', 401);
    throw error;
  }
};

export const logoutService = async (refreshToken: string) => {
  await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
};

export const getUserService = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại hoặc bị khóa', 404);
    }
    return user;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[getUserService] error:', error.message);
    throw error;
  }
};
