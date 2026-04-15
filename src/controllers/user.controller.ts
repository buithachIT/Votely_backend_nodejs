import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../helpers/response.helper';
import {
  createUserService,
  loginService,
  getUserService,
  refreshTokenService,
} from '../services/user.service';

const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const user = await createUserService(
      firstName,
      lastName,
      email,
      phone,
      password,
    );
    return sendSuccess(res, {
      data: user,
      message: 'User created successfully',
      statusCode: 201,
    });
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Existing email') {
      return sendError(res, { message: err.message, statusCode: 400 });
    }
    console.error(error);
    return sendError(res, {
      message: 'Server Internal Error',
      statusCode: 500,
    });
  }
};

const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return sendError(res, {
        message: 'Email and password are required',
        statusCode: 400,
      });
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return sendSuccess(res, {
      data: { accessToken, user },
      message: 'Login successful',
      statusCode: 200,
    });
  } catch (error) {
    const err = error as Error;
    console.error(error);

    if (err.message === 'Invalid email or password') {
      return sendError(res, { message: err.message, statusCode: 401 });
    }
    if (err.message === 'Missing JWT_SECRET_KEY') {
      return sendError(res, {
        message: 'Server misconfiguration',
        statusCode: 500,
      });
    }

    return sendError(res, {
      message: 'Internal Server Error',
      statusCode: 500,
    });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendError(res, {
        message: 'User ID is missing',
        statusCode: 401,
      });
    }

    const user = await getUserService(userId);
    return sendSuccess(res, {
      data: user,
      message: 'User profile retrieved',
      statusCode: 200,
    });
  } catch (error) {
    const err = error as Error;
    console.error(error);

    if (err.message === 'User not found') {
      return sendError(res, { message: err.message, statusCode: 404 });
    }

    return sendError(res, {
      message: 'Internal Server Error',
      statusCode: 500,
    });
  }
};

const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const cookieHeader = req.headers.cookie;
    const refreshToken = cookieHeader
      ?.split('; ')
      .find((cookie) => cookie.startsWith('refreshToken='))
      ?.substring('refreshToken='.length);

    if (!refreshToken) {
      return sendError(res, {
        message: 'Refresh token is missing',
        statusCode: 401,
      });
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      data: { accessToken, user },
      message: 'Token refreshed',
      statusCode: 200,
    });
  } catch (error) {
    const err = error as Error;
    console.error(error);
    return sendError(res, {
      message: err.message || 'Unable to refresh token',
      statusCode: 401,
    });
  }
};

const handleLogout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return sendSuccess(res, {
      message: 'Logout successful',
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, {
      message: 'Internal Server Error',
      statusCode: 500,
    });
  }
};
export {
  createUser,
  handleLogin,
  handleRefreshToken,
  getCurrentUser,
  handleLogout,
};
