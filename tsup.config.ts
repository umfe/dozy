import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', '!src/*.d.ts'], // Auto-discover .ts files, exclude .d.ts
  format: ['esm'],
  dts: true,
  minify: false,
  sourcemap: true,
  clean: true,
  treeshake: true, // 打包时对内联依赖做 tree-shake，剔除未使用的代码
  splitting: true, // 拆分共享 chunk：多入口共用依赖只存一份，避免状态/实例不一致
  noExternal: [/(.*)/], // 把依赖内联进产物：装了 dozy 就无需再单独安装 axios 等
  platform: 'browser', // Force browser platform to polyfill/stub node builtins
  shims: true, // Inject shims for Node.js built-ins
})
