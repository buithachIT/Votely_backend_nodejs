import dotenv from "dotenv";
dotenv.config();
import validateEnv from "./config/validateEnv";

validateEnv();
import connection from "./config/database";
import app from "./app";

const port = process.env.PORT || 8083;

(async (): Promise<void> => {
  try {
    await connection();

    app.listen(port, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
      console.log(
        `📝 Tài liệu API (Swagger): http://localhost:${port}/api-docs`,
      );
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Lỗi khởi động server:", error.message);
    } else {
      console.error("❌ Lỗi không xác định:", error);
    }
    process.exit(1);
  }
})();
