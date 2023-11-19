import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // the address of the backend server
        changeOrigin: true,
        secure: false,
        // If needed, you can rewrite the path here
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
