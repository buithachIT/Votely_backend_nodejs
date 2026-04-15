"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const envSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid("development", "production", "test").default("development"),
    PORT: joi_1.default.number().default(8083),
    MONGO_URI: joi_1.default.string().uri().required(),
    JWT_SECRET_KEY: joi_1.default.string().min(32).required(),
    JWT_REFRESH_SECRET: joi_1.default.string().min(32).optional(),
    FRONTEND_ORIGIN: joi_1.default.string().uri().optional(),
}).unknown(true);
const validateEnv = () => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
        allowUnknown: true,
    });
    if (error) {
        console.error("Environment validation failed:", error.details.map((detail) => detail.message).join(", "));
        process.exit(1);
    }
    process.env.NODE_ENV = value.NODE_ENV;
    process.env.PORT = String(value.PORT);
    process.env.JWT_REFRESH_SECRET = value.JWT_REFRESH_SECRET || value.JWT_SECRET_KEY;
};
exports.default = validateEnv;
