import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/doctors': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/patients': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/appointments': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/medical-records': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/prescriptions': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/doctor-notes': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/lab-reports': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/data-sharing': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/notifications': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/access-logs': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
