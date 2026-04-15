"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserService = exports.refreshTokenService = exports.loginService = exports.createUserService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createUserService = async (firstName, lastName, email, phone, password) => {
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        let result = await user_model_1.default.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            role: "voter",
            password: hashedPassword,
        });
        return result;
    }
    catch (error) {
        console.log(error);
        const err = error;
        if (err.code === 11000 && err.keyPattern.email) {
            throw new Error("Existing email");
        }
        throw error;
    }
};
exports.createUserService = createUserService;
const loginService = async (email, password) => {
    try {
        const user = await user_model_1.default.findOne({ email: email }).select("+password");
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password || "");
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        if (!jwtSecretKey) {
            throw new Error("Missing JWT_SECRET_KEY");
        }
        const refreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecretKey;
        const refreshToken = jsonwebtoken_1.default.sign({ sub: user._id.toString() }, refreshSecret, { expiresIn: "7d" });
        const accessToken = jsonwebtoken_1.default.sign({ sub: user._id.toString(), role: user.role }, jwtSecretKey, { expiresIn: "15m" });
        return { accessToken, refreshToken, user };
    }
    catch (err) {
        const error = err;
        console.error("[loginService] error:", error.message);
        throw error;
    }
};
exports.loginService = loginService;
const refreshTokenService = async (refreshToken) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY;
    if (!refreshSecret) {
        throw new Error("Missing JWT_SECRET_KEY");
    }
    const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
    const userId = decoded.sub;
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const newRefreshToken = jsonwebtoken_1.default.sign({ sub: userId }, refreshSecret, { expiresIn: "7d" });
    const accessToken = jsonwebtoken_1.default.sign({ sub: userId, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
    return { accessToken, refreshToken: newRefreshToken, user };
};
exports.refreshTokenService = refreshTokenService;
const getUserService = async (userId) => {
    try {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (err) {
        const error = err;
        console.error("[getUserService] error:", error.message);
        throw error;
    }
};
exports.getUserService = getUserService;
