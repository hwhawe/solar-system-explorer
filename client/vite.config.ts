import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Pastikan port Vite sama dengan yang di error (atau yang Anda inginkan)
    proxy: {
      '/api': { // Setiap permintaan yang dimulai dengan '/api'
        target: 'http://localhost:3001', // Akan dialihkan ke backend Node.js
        changeOrigin: true, // Diperlukan untuk host virtual
        rewrite: (path) => path.replace(/^\/api/, ''), // Menghapus '/api' dari path yang diteruskan ke backend
      },
    },
  },
})