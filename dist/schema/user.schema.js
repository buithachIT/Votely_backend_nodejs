"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const registerSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(30).required(),
    lastName: joi_1.default.string().min(2).max(30).required(),
    email: joi_1.default.string().email().required(),
    phone: joi_1.default.string()
        .pattern(/^(0\d{9}|\+84\s?\d{9})$/)
        .required()
        .messages({
        'string.pattern.base': 'Phone must start with 0 or +84 and have 10 digits total.',
    }),
    password: joi_1.default.string().min(6).required(),
    confirmPassword: joi_1.default.any()
        .valid(joi_1.default.ref('password'))
        .required()
        .messages({ 'any.only': 'Passwords do not match.' }),
    terms: joi_1.default.boolean().valid(true).required().messages({
        'any.only': 'You must accept the Terms & Conditions.',
        'any.required': 'You must accept the Terms & Conditions.',
    }),
    marketing_emails: joi_1.default.boolean().default(false),
});
exports.registerSchema = registerSchema;
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.loginSchema = loginSchema;
