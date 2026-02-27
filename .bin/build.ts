import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { $ } from 'bun'
import packageJson from '../package.json'

const SHEBANG = '#!/usr/bin/env node\n'
const deps = Object.keys(packageJson.dependencies ?? {})

rmSync('dist', { recursive: true, force: true })

// CLI bundled — all deps inlined, single self-contained file
const bundled = await Bun.build({
  entrypoints: ['src/touch-all.ts'],
  outdir: 'dist/bundled',
  target: 'node',
  format: 'esm',
})
if (!bundled.success) throw new AggregateError(bundled.logs, 'Bundled build failed')
prependShebang('dist/bundled/touch-all.js')

// CLI slim — deps kept external (npm installs them alongside)
const slim = await Bun.build({
  entrypoints: ['src/touch-all.ts'],
  outdir: 'dist/slim',
  target: 'node',
  format: 'esm',
  external: deps,
})
if (!slim.success) throw new AggregateError(slim.logs, 'Slim build failed')
prependShebang('dist/slim/touch-all.js')

// Library — importable API, deps kept external
const lib = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist/lib',
  target: 'node',
  format: 'esm',
  external: deps,
})
if (!lib.success) throw new AggregateError(lib.logs, 'Library build failed')

// Type declarations via tsc
await $`bunx tsc --project .config/tsconfig.dts.json`

function prependShebang(file: string) {
  const content = readFileSync(file, 'utf8')
  if (!content.startsWith('#!')) {
    writeFileSync(file, SHEBANG + content)
  }
}
