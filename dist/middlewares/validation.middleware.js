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
            const messages = error.details.map((detail) => detail.message).join(", ");
            return (0, response_helper_1.sendError)(res, {
                message: messages,
                statusCode: 400,
            });
        }
        req.body = value;
        next();
    };
};
exports.validateBody = validateBody;
