// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/entry/lib.ts'),
      name: 'lib',
      fileName: (format) => `lib.${format}.js`,
    },
    sourcemap: false,
    target: 'es6'
  }
})