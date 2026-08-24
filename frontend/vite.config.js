import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0) for multi-device LAN access
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
      '/auth': {
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
      '/admin': {
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
      '/forgot-password': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/reset-password': {
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
