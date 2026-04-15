"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const validation_middleware_1 = require("@/middlewares/validation.middleware");
const user_schema_1 = require("@/schema/user.schema");
const routerAPI = express_1.default.Router();
routerAPI.post("/register", rateLimiter_1.registerLimiter, (0, validation_middleware_1.validateBody)(user_schema_1.registerSchema), user_controller_1.createUser);
routerAPI.post("/login", rateLimiter_1.loginLimiter, (0, validation_middleware_1.validateBody)(user_schema_1.loginSchema), user_controller_1.handleLogin);
routerAPI.post("/refresh", user_controller_1.handleRefreshToken);
routerAPI.get("/me", rateLimiter_1.authMiddleware, user_controller_1.getCurrentUser);
routerAPI.post("/logout", rateLimiter_1.authMiddleware, user_controller_1.handleLogout);
exports.default = routerAPI;
