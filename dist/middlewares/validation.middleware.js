"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const response_helper_1 = require("@/helpers/response.helper");
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.reduce((acc, detail) => {
                const field = detail.path.join('.');
                acc[field] = detail.message.replace(/['"]/g, '');
                return acc;
            }, {});
            return (0, response_helper_1.sendError)(res, {
                message: 'Dữ liệu không hợp lệ',
                statusCode: 400,
                errors,
            });
        }
        req.body = value;
        next();
    };
};
exports.validateBody = validateBody;
