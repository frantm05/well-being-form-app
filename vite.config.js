import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward dev requests to Wix function to avoid CORS and prevent Vite from
      // serving index.html for the /api/questions route.
      '/api/questions': {
        target: 'https://matejfrantik.wixsite.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/questions/, '/well-being-form/_functions/getQuestions')
      }
    }
  }
})
