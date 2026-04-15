"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, { data = null, message = "Success", statusCode = 200 } = {}) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
        errors: null,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, { message = "Error", statusCode = 500, errors = null } = {}) => {
    return res.status(statusCode).json({
        success: false,
        data: null,
        message,
        errors,
    });
};
exports.sendError = sendError;
