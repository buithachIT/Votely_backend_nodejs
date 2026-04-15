"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const api_1 = __importDefault(require("./routes/api"));
const helmet_1 = __importDefault(require("helmet"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
const app = (0, express_1.default)();
/**
 * 2. Cấu hình Middlewares (Phải nằm TRÊN các route)
 */
app.use((0, helmet_1.default)({
    // 1. Content Security Policy: Quy định nguồn tài nguyên được phép tải
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"], // Cho phép script nội bộ
            "style-src": [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
            ], // PrimeVue cần unsafe-inline
            "img-src": ["'self'", "data:", "https://res.cloudinary.com"], // Cho phép ảnh từ Cloudinary
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'"], // Chỉ cho phép gọi API đến chính server này
        },
    },
    // 2. Chống Clickjacking: Chỉ cho phép nhúng iframe từ chính site mình
    frameguard: {
        action: "sameorigin",
    },
    // 3. Ẩn thông tin công nghệ: Xóa header X-Powered-By
    hidePoweredBy: true,
    // 4. Ép buộc HTTPS (HSTS)
    hsts: {
        maxAge: 31536000, // 1 năm
        includeSubDomains: true,
        preload: true,
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/v1/api", rateLimiter_1.apiLimiter);
/**
 * 3. Cấu hình Swagger (Dùng file YAML cho khỏe, tự format được)
 */
/**
 * 4. Cấu hình Swagger (Dùng file YAML cho khỏe, tự format được)
 * Đảm bảo file swagger.yaml nằm cùng cấp với file này
 */
try {
    const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "./swagger.yaml"));
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    console.log("Docs available at http://localhost:8083/api-docs");
}
catch (e) {
    console.error("Swagger load failed:", e instanceof Error ? e.message : e);
}
/**
 * 5. Cấu hình Routes
 */
app.use("/v1/api", api_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON payload",
            errors: err.message,
        });
    }
    const error = err;
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        errors: process.env.NODE_ENV === "development" ? error.stack : null,
    });
});
exports.default = app;
