import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/register': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/me': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/orders': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/create-order': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/cod': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/recommend': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/forecast': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
