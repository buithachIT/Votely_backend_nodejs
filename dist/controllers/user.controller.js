"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogout = exports.getCurrentUser = exports.handleRefreshToken = exports.handleLogin = exports.createUser = void 0;
const response_helper_1 = require("@/helpers/response.helper");
const user_service_1 = require("@/services/user.service");
const catch_async_util_1 = require("@/utils/catch-async.util");
const expired_jwt_1 = require("@/config/expired-jwt");
const app_error_util_1 = require("@/utils/app-error.util");
const createUser = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body || {};
    if (!firstName || !lastName || !email || !phone || !password) {
        throw new app_error_util_1.AppError('Tất cả các trường đều là bắt buộc', 400);
    }
    const user = await (0, user_service_1.createUserService)(firstName, lastName, email, phone, password);
    (0, response_helper_1.sendSuccess)(res, {
        data: user,
        message: 'Người dùng đã được tạo thành công',
        statusCode: 201,
    });
});
exports.createUser = createUser;
const handleLogin = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new app_error_util_1.AppError('Email và password là bắt buộc', 400);
    }
    const { accessToken, refreshToken, user } = await (0, user_service_1.loginService)(email, password);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: expired_jwt_1.EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN,
    });
    (0, response_helper_1.sendSuccess)(res, {
        data: { accessToken, user },
        message: 'Đăng nhập thành công',
        statusCode: 200,
    });
});
exports.handleLogin = handleLogin;
const getCurrentUser = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        throw new app_error_util_1.AppError('Bạn chưa đăng nhập hoặc phiên làm việc hết hạn', 401);
    }
    const user = await (0, user_service_1.getUserService)(userId);
    (0, response_helper_1.sendSuccess)(res, {
        data: user,
        message: 'Thông tin người dùng đã được lấy thành công',
    });
});
exports.getCurrentUser = getCurrentUser;
const handleRefreshToken = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new app_error_util_1.AppError('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại', 401);
    }
    const { accessToken, refreshToken: newRefreshToken, user, } = await (0, user_service_1.refreshTokenService)(refreshToken);
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: expired_jwt_1.EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN, // 7 days
    });
    (0, response_helper_1.sendSuccess)(res, {
        data: { accessToken, user },
        message: 'Làm mới phiên làm việc thành công',
    });
});
exports.handleRefreshToken = handleRefreshToken;
const handleLogout = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        try {
            await (0, user_service_1.logoutService)(refreshToken);
        }
        catch (error) {
            console.error('[Logout] Failed to delete token in DB:', error);
        }
    }
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });
    (0, response_helper_1.sendSuccess)(res, {
        message: 'Đăng xuất thành công',
    });
});
exports.handleLogout = handleLogout;
