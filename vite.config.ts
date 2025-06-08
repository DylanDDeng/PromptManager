import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: 'popup.html',
        options: 'options.html',
        background: 'src/background.ts',
        content: 'src/content.ts',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        // 强制内联所有模块，避免动态导入
        inlineDynamicImports: false,
        manualChunks: (id) => {
          // 将background和content的依赖内联到主文件中
          if (id.includes('background.ts') || id.includes('content.ts')) {
            return undefined; // 不创建单独的chunk
          }
          // 其他文件可以创建chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    target: 'es2020',
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
