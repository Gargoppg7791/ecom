import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/api/images': {
        target: 'http://localhost:5454',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/images/, '/images'),
        secure: false,
        ws: true
      }
    }
  }
})