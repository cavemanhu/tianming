import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://192.168.3.45:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    minify: 'terser',
    define: {
      'process.env.NODE_ENV': JSON.stringify('development')
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
