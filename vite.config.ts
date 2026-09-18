import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 单文件构建：`npm run build:single-file`（即 `vite build --mode single-file`）
  // 产物为 dist-single-file/index.html；默认构建产多文件到 dist/
  const singleFile = mode === 'single-file'

  return {
    base: './',
    plugins: [
      vue(),
      vueDevTools(),
      ...(singleFile ? [viteSingleFile()] : []),
      tailwindcss(),
    ],
    build: {
      outDir: singleFile ? 'dist-single-file' : 'dist',
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
