import { Request, Response } from 'express';
import { sendSuccess } from '@/helpers/response.helper';
import {
  createUserService,
  loginService,
  getUserService,
  refreshTokenService,
  logoutService,
} from '@/services/user.service';
import { catchAsync } from '@/utils/catch-async.util';
import { EXPIRED_TOKEN } from '@/config/expired-jwt';
import { AppError } from '@/utils/app-error.util';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, password } = req.body || {};

  if (!firstName || !lastName || !email || !phone || !password) {
    throw new AppError('Tất cả các trường đều là bắt buộc', 400);
  }

  const user = await createUserService(
    firstName,
    lastName,
    email,
    phone,
    password,
  );
  sendSuccess(res, {
    data: user,
    message: 'Người dùng đã được tạo thành công',
    statusCode: 201,
  });
});

const handleLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email và password là bắt buộc', 400);
  }

  const { accessToken, refreshToken, user } = await loginService(
    email,
    password,
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN,
  });

  sendSuccess(res, {
    data: { accessToken, user },
    message: 'Đăng nhập thành công',
    statusCode: 200,
  });
});
const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError('Bạn chưa đăng nhập hoặc phiên làm việc hết hạn', 401);
  }

  const user = await getUserService(userId);

  sendSuccess(res, {
    data: user,
    message: 'Thông tin người dùng đã được lấy thành công',
  });
});

const handleRefreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại',
      401,
    );
  }

  const {
    accessToken,
    refreshToken: newRefreshToken,
    user,
  } = await refreshTokenService(refreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN, // 7 days
  });

  sendSuccess(res, {
    data: { accessToken, user },
    message: 'Làm mới phiên làm việc thành công',
  });
});

const handleLogout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      await logoutService(refreshToken);
    } catch (error) {
      console.error('[Logout] Failed to delete token in DB:', error);
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  sendSuccess(res, {
    message: 'Đăng xuất thành công',
  });
});

export {
  createUser,
  handleLogin,
  handleRefreshToken,
  getCurrentUser,
  handleLogout,
};
