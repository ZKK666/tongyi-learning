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
        /**
         * 配置 SSE 支持
         *
         * 学习要点：
         * - configure 允许自定义代理行为
         * - 对于 SSE 请求，需要禁用代理缓冲
         * - 否则数据会被缓冲，无法实现打字机效果
         */
        configure: (proxy) => {
          // 监听代理响应，对 SSE 响应禁用缓冲
          proxy.on('proxyRes', (proxyRes, req) => {
            if (req.url?.includes('/chat/stream')) {
              // 确保响应不被缓冲
              // 设置为 undefined 让 Node.js 使用默认的非缓冲行为
              proxyRes.headers['cache-control'] = 'no-cache';
              proxyRes.headers['x-accel-buffering'] = 'no';
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
