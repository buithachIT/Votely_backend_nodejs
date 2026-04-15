"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.registerLimiter = exports.loginLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_helper_1 = require("../helpers/response.helper");
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        message: "Too many requests, please try later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.apiLimiter = apiLimiter;
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        message: "Too many login attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.loginLimiter = loginLimiter;
const registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        message: "Too many registration attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.registerLimiter = registerLimiter;
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return (0, response_helper_1.sendError)(res, {
                message: "Access token is required",
                statusCode: 401,
            });
        }
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        if (!jwtSecretKey) {
            return (0, response_helper_1.sendError)(res, {
                message: "Server misconfiguration",
                statusCode: 500,
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecretKey);
        req.userId = decoded.sub;
        next();
    }
    catch (error) {
        const err = error;
        if (err.name === "TokenExpiredError") {
            return (0, response_helper_1.sendError)(res, {
                message: "Token expired",
                statusCode: 401,
            });
        }
        if (err.name === "JsonWebTokenError") {
            return (0, response_helper_1.sendError)(res, {
                message: "Invalid token",
                statusCode: 401,
            });
        }
        (0, response_helper_1.sendError)(res, {
            message: "Authentication failed",
            statusCode: 401,
        });
    }
};
exports.authMiddleware = authMiddleware;
