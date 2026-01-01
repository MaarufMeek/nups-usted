import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'], // Ensure only one version of React is used
  },
      server: {
    port: 5173,
    strictPort: true,
  },
})
