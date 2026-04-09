import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { contributePlugin } from './src/server/contributePlugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), contributePlugin()],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contribute: resolve(__dirname, 'contribute/index.html'),
      },
    },
  },
})
