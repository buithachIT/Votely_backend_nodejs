"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const api_1 = __importDefault(require("./routes/api"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limiter_middleware_1 = require("./middlewares/rate-limiter.middleware");
const app_error_util_1 = require("./utils/app-error.util");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': [
                "'self'",
                "'unsafe-inline'",
                'https://fonts.googleapis.com',
            ],
            'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'connect-src': ["'self'"],
        },
    },
    frameguard: {
        action: 'sameorigin',
    },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));
const buildCorsOrigins = () => {
    const raw = process.env.FRONTEND_ORIGIN;
    if (!raw) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FRONTEND_ORIGIN must be set in production');
        }
        return ['http://localhost:5173'];
    }
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
};
const allowedOrigins = buildCorsOrigins();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Cho phép request không có origin (ví dụ: curl, mobile app, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/v1/api', rate_limiter_middleware_1.apiLimiter);
try {
    const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, './swagger.yaml'));
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    console.log('Docs available at http://localhost:8083/api-docs');
}
catch (e) {
    console.error('Swagger load failed:', e instanceof Error ? e.message : e);
}
app.use('/v1/api', api_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
app.use((err, req, res, _next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload',
            errors: null,
        });
    }
    if (err instanceof app_error_util_1.AppError) {
        const appErr = err;
        return res.status(appErr.statusCode).json({
            success: false,
            message: appErr.message,
            errors: null,
        });
    }
    console.error('[UnhandledError]', err);
    const error = err;
    return res.status(500).json({
        success: false,
        message: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau',
        errors: process.env.NODE_ENV === 'development' ? (error.stack ?? null) : null,
    });
});
exports.default = app;
