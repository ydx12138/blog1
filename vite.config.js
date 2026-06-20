import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // SPA 模式：所有路径都回退到 index.html
  appType: 'spa',
  server: {
    // 前端路由 SPA fallback (Vite 默认开启，显式声明)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  // 生产构建时使用绝对路径
  base: '/',
})
