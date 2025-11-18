import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,  // Vite 默认端口
    open: true,
    /**
     * API 代理配置
     *
     * 学习要点：
     * - 开发时前端在 5173，后端在 3001
     * - 代理将 /api 请求转发到后端
     * - 解决开发环境的跨域问题
     */
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
