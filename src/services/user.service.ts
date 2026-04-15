import { isMongoError } from '@/utils/typeGuards';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
      throw new Error('Email hoặc số điện thoại đã tồn tại');
    }
    throw error;
  }
};

const generateTokens = (userId: string) => {
  const accessTokenSecret = process.env.JWT_SECRET_KEY;
  const refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || accessTokenSecret;

  if (!accessTokenSecret) {
    throw new Error('Cấu hình server thiếu JWT_SECRET_KEY');
  }

  const accessToken = jwt.sign({ sub: userId }, accessTokenSecret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ sub: userId }, refreshTokenSecret!, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const loginService = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng!');
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không đúng!');
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      throw new Error('Missing JWT_SECRET_KEY');
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    return { accessToken, refreshToken, user };
  } catch (err) {
    const error = err as Error;
    console.error('[loginService] error:', error.message);
    throw error;
  }
};

export const refreshTokenService = async (refreshToken: string) => {
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY;

  if (!refreshSecret) {
    throw new Error('Server configuration missing secret keys');
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
    const userId = decoded.sub as string;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found or account disabled');
    }

    const tokens = generateTokens(user.id);

    const safeUserData = user.toObject();

    return {
      ...tokens,
      user: safeUserData,
    };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw err;
  }
};

export const getUserService = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[getUserService] error:', error.message);
    throw error;
  }
};
