import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/*
 ******************************************************************
  공동 작성자: 배지원, 오수경
 ******************************************************************
 */

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/swingbench": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
