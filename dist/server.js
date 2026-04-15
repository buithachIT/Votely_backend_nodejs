"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateEnv_1 = __importDefault(require("./config/validateEnv"));
(0, validateEnv_1.default)();
const database_1 = __importDefault(require("./config/database"));
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT || 8083;
(async () => {
    try {
        await (0, database_1.default)();
        app_1.default.listen(port, () => {
            console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
            console.log(`📝 Tài liệu API (Swagger): http://localhost:${port}/api-docs`);
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("❌ Lỗi khởi động server:", error.message);
        }
        else {
            console.error("❌ Lỗi không xác định:", error);
        }
        process.exit(1);
    }
})();
