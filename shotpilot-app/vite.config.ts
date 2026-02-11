import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Force all React imports (from any dependency) to resolve to the exact
// same module files.  Without this, Vite's esbuild pre-bundler can create
// separate chunks that each embed their own copy of React's CJS internals,
// which causes "Invalid hook call" because the hooks dispatcher set by
// ReactDOM is invisible to the useState from the other chunk.
const reactPath = resolve(__dirname, 'node_modules/react')
const reactDomPath = resolve(__dirname, 'node_modules/react-dom')

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': reactPath,
      'react-dom': reactDomPath
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    force: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
