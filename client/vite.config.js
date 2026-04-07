import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react'
          }

          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui'
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          return undefined
        }
      }
    },
    chunkSizeWarningLimit: 650
  }
})
