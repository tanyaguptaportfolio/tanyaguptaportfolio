import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
  server: {
    host: '127.0.0.1',
  },
  test: { environment: 'jsdom', include: ['src/**/*.test.js'] },
})
