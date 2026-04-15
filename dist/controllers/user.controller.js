"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogout = exports.getCurrentUser = exports.handleRefreshToken = exports.handleLogin = exports.createUser = void 0;
const response_helper_1 = require("../helpers/response.helper");
const user_service_1 = require("../services/user.service");
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const user = await (0, user_service_1.createUserService)(firstName, lastName, email, phone, password);
        return (0, response_helper_1.sendSuccess)(res, {
            data: user,
            message: "User created successfully",
            statusCode: 201,
        });
    }
    catch (error) {
        const err = error;
        if (err.message === "Existing email") {
            return (0, response_helper_1.sendError)(res, { message: err.message, statusCode: 400 });
        }
        console.error(error);
        return (0, response_helper_1.sendError)(res, {
            message: "Server Internal Error",
            statusCode: 500,
        });
    }
};
exports.createUser = createUser;
const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return (0, response_helper_1.sendError)(res, {
                message: "Email and password are required",
                statusCode: 400,
            });
        }
        const { accessToken, refreshToken, user } = await (0, user_service_1.loginService)(email, password);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return (0, response_helper_1.sendSuccess)(res, {
            data: { accessToken, user },
            message: "Login successful",
            statusCode: 200,
        });
    }
    catch (error) {
        const err = error;
        console.error(error);
        if (err.message === "Invalid email or password") {
            return (0, response_helper_1.sendError)(res, { message: err.message, statusCode: 401 });
        }
        if (err.message === "Missing JWT_SECRET_KEY") {
            return (0, response_helper_1.sendError)(res, {
                message: "Server misconfiguration",
                statusCode: 500,
            });
        }
        return (0, response_helper_1.sendError)(res, {
            message: "Internal Server Error",
            statusCode: 500,
        });
    }
};
exports.handleLogin = handleLogin;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return (0, response_helper_1.sendError)(res, {
                message: "User ID is missing",
                statusCode: 401,
            });
        }
        const user = await (0, user_service_1.getUserService)(userId);
        return (0, response_helper_1.sendSuccess)(res, {
            data: user,
            message: "User profile retrieved",
            statusCode: 200,
        });
    }
    catch (error) {
        const err = error;
        console.error(error);
        if (err.message === "User not found") {
            return (0, response_helper_1.sendError)(res, { message: err.message, statusCode: 404 });
        }
        return (0, response_helper_1.sendError)(res, {
            message: "Internal Server Error",
            statusCode: 500,
        });
    }
};
exports.getCurrentUser = getCurrentUser;
const handleRefreshToken = async (req, res) => {
    try {
        const cookieHeader = req.headers.cookie;
        const refreshToken = cookieHeader
            ?.split("; ")
            .find((cookie) => cookie.startsWith("refreshToken="))
            ?.substring("refreshToken=".length);
        if (!refreshToken) {
            return (0, response_helper_1.sendError)(res, {
                message: "Refresh token is missing",
                statusCode: 401,
            });
        }
        const { accessToken, refreshToken: newRefreshToken, user } = await (0, user_service_1.refreshTokenService)(refreshToken);
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return (0, response_helper_1.sendSuccess)(res, {
            data: { accessToken, user },
            message: "Token refreshed",
            statusCode: 200,
        });
    }
    catch (error) {
        const err = error;
        console.error(error);
        return (0, response_helper_1.sendError)(res, {
            message: err.message || "Unable to refresh token",
            statusCode: 401,
        });
    }
};
exports.handleRefreshToken = handleRefreshToken;
const handleLogout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        return (0, response_helper_1.sendSuccess)(res, {
            message: "Logout successful",
            statusCode: 200,
        });
    }
    catch (error) {
        console.error(error);
        return (0, response_helper_1.sendError)(res, {
            message: "Internal Server Error",
            statusCode: 500,
        });
    }
};
exports.handleLogout = handleLogout;
