import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts', '!src/*.d.ts'], // Auto-discover .ts files, exclude .d.ts
  format: ['esm'],
  dts: true,
  minify: true,
  sourcemap: true,
  clean: true,
  noExternal: [/(.*)/],
  platform: 'browser', // Force browser platform to polyfill/stub node builtins
  shims: true, // Inject shims for Node.js built-ins
})
