import { defineConfig } from 'tsup'
import { readFileSync, writeFileSync } from 'fs'

const USE_CLIENT = '"use client";\n'

function prependUseClient(file: string): void {
  const content = readFileSync(file, 'utf8')
  if (!content.startsWith('"use client"')) {
    writeFileSync(file, USE_CLIENT + content)
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  sourcemap: true,
  treeshake: true,
  async onSuccess() {
    prependUseClient('dist/index.js')
    prependUseClient('dist/index.mjs')
  },
})
