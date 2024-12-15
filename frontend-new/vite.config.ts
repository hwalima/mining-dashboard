import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'recharts', 
      '@mui/material', 
      '@emotion/react', 
      '@emotion/styled',
      '@mui/x-date-pickers',
      '@mui/x-date-pickers/DatePicker',
      '@mui/x-date-pickers/LocalizationProvider',
      '@mui/x-date-pickers/AdapterDateFns',
      'date-fns',
      'date-fns/_lib/format/longFormatters'
    ],
    force: true,
    esbuildOptions: {
      preserveSymlinks: true
    }
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      'date-fns': 'date-fns',
      '@mui/x-date-pickers': '@mui/x-date-pickers'
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', '@mui/material'],
          'mui': ['@mui/material', '@mui/x-date-pickers'],
          'date-utils': ['date-fns'],
        },
      },
    },
  },
})
