"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserService = exports.logoutService = exports.refreshTokenService = exports.loginService = exports.createUserService = void 0;
const type_guards_util_1 = require("@/utils/type-guards.util");
const user_model_1 = __importDefault(require("../models/user.model"));
const refresh_token_model_1 = __importDefault(require("../models/refresh-token.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_error_util_1 = require("@/utils/app-error.util");
const expired_jwt_1 = require("@/config/expired-jwt");
const auth_util_1 = require("@/utils/auth.util");
const createUserService = async (firstName, lastName, email, phone, password) => {
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await user_model_1.default.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            password: hashedPassword,
        });
        return result;
    }
    catch (error) {
        if ((0, type_guards_util_1.isMongoError)(error) && error.code === 11000) {
            throw new app_error_util_1.AppError('Email đã tồn tại', 400);
        }
        throw error;
    }
};
exports.createUserService = createUserService;
const loginService = async (email, password) => {
    const user = await user_model_1.default.findOne({ email: email }).select('+password');
    if (!user || !(await bcrypt_1.default.compare(password, user.password || ''))) {
        throw new app_error_util_1.AppError('Email hoặc mật khẩu không đúng', 401);
    }
    const { accessToken, refreshToken } = (0, auth_util_1.generateTokens)(user.id);
    await refresh_token_model_1.default.create({
        tokenHash: (0, auth_util_1.hashToken)(refreshToken),
        userId: user._id,
        expiresAt: new Date(Date.now() + expired_jwt_1.EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN),
    });
    return { accessToken, refreshToken, user };
};
exports.loginService = loginService;
const refreshTokenService = async (refreshToken) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY;
    if (!refreshSecret) {
        throw new app_error_util_1.AppError('Server configuration missing secret keys', 500);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        const userId = decoded.sub;
        const stored = await refresh_token_model_1.default.findOneAndDelete({
            tokenHash: (0, auth_util_1.hashToken)(refreshToken),
            userId,
        });
        if (!stored) {
            throw new app_error_util_1.AppError('Phiên làm việc không hợp lệ hoặc đã bị thu hồi', 401);
        }
        const user = await user_model_1.default.findById(userId);
        if (!user)
            throw new app_error_util_1.AppError('Tài khoản không tồn tại hoặc bị khóa', 404);
        const tokens = (0, auth_util_1.generateTokens)(user.id);
        await refresh_token_model_1.default.create({
            tokenHash: (0, auth_util_1.hashToken)(tokens.refreshToken),
            userId: user._id,
            expiresAt: new Date(Date.now() + expired_jwt_1.EXPIRED_TOKEN.EXPIRED_REFRESH_TOKEN),
        });
        return {
            ...tokens,
            user: user.toObject(),
        };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError)
            throw new app_error_util_1.AppError('Phiên đăng nhập hết hạn', 401);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError)
            throw new app_error_util_1.AppError('Token không hợp lệ', 401);
        throw error;
    }
};
exports.refreshTokenService = refreshTokenService;
const logoutService = async (refreshToken) => {
    await refresh_token_model_1.default.deleteOne({ tokenHash: (0, auth_util_1.hashToken)(refreshToken) });
};
exports.logoutService = logoutService;
const getUserService = async (userId) => {
    try {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new app_error_util_1.AppError('Tài khoản không tồn tại hoặc bị khóa', 404);
        }
        return user;
    }
    catch (err) {
        const error = err;
        console.error('[getUserService] error:', error.message);
        throw error;
    }
};
exports.getUserService = getUserService;
