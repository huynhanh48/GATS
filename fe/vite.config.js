import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'PUBLIC_', 'BANK_', 'SEPAY_'],
  // Cổng 3002 khớp docker-compose (3002:3002), FRONTEND_URL của be và
  // ecosystem.dev.config.js — đổi ở đây là đổi cho cả dev trên máy lẫn Docker.
  server: {
    port: 3002,
    host: true,
  },
  preview: {
    port: 3002,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

