import { defineConfig } from 'tsup';

export default defineConfig([
  // 主构建：CJS + ESM
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    treeshake: true,
    target: 'es2020',
    outDir: 'dist',
  },
  // 浏览器构建：IIFE 格式，用于文档站点和 CDN
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'Fingerprint',
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: true,
    treeshake: true,
    target: 'es2020',
    outDir: 'dist',
    outExtension: () => ({ js: '.browser.js' }),
  },
]);
