import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
          target: 'http://127.0.0.1:8000', 
          changeOrigin: true,
      }
    }
  }
}) 
