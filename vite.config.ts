import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  // server: {
  //   port: 8881,
  //   open: true,
  // },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/style/element/index.scss" as *;`,
      },
    },
  },
  build: {
    outDir: "dists",
  },
  optimizeDeps: {
    exclude: ["element-plus"],
  },
  server: {
    port: 8881,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
