import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Sử dụng các cấu hình đề xuất từ ESLint và TS-ESLint
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // 2. Chỉ định các file sẽ áp dụng rules này
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Giúp ESLint hiểu sâu về các Type trong dự án
      },
      globals: {
        ...globals.node, // Quan trọng: Cho phép dùng process, module, __dirname...
      },
    },
    rules: {
      // 3. NHUỘM ĐỎ CHỮ ANY
      "@typescript-eslint/no-explicit-any": "error",

      // 4. Bắt lỗi không dùng biến (trừ những biến có dấu gạch dưới như _doc)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // 5. Cấm dùng 'require' (Bắt buộc dùng import/export cho chuẩn ES Modules)
      "@typescript-eslint/no-var-requires": "error",

      // 6. Cho phép console.log nhưng sẽ cảnh báo (BE hay dùng log để debug)
      "no-console": "off",
    },
  },

  // 7. Loại bỏ các thư mục không cần check
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
);
