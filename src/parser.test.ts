// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { test, expect } from 'vitest'
import { parserFolderStructure } from './parser'

test('Basic constrains for parserFolderStructure', () => {
  const parser = parserFolderStructure

  expect(parser('/')).toHaveLength(0)
  expect(parser('demo')).toEqual([{ path: 'demo', type: 'file' }])
  expect(parser('demo/')).toSatisfy(Array.isArray)
  expect(parser('demo/')).toEqual([{ path: 'demo', type: 'folder' }])
  expect(parser('demo/demo/')).toEqual([{ path: 'demo/demo', type: 'folder' }])
  expect(parser('/demo/demo/')).toEqual([{ path: 'demo/demo', type: 'folder' }])
  expect(parser('  /demo/demo/')).toEqual([{ path: 'demo/demo', type: 'folder' }])
  expect(parser('./demo')).toEqual([{ path: 'demo', type: 'file' }])
  expect(parser('./demo/')).toEqual([{ path: 'demo', type: 'folder' }])
  expect(parser('./demo/demo/')).toEqual([{ path: 'demo/demo', type: 'folder' }])
})

test('Complex constrains with drawing symbols', () => {
  const parser = parserFolderStructure
  const structure = `
my-project/
├── .config/
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   ├── vite.config.ts
│   └── oxlint.json
├── src/
│   ├── sample/
│   │   ├── index.ts
│   │   └── index.test.ts
│   ├── index.ts
│   └── index.test.ts
├── package.json
├── README.md
└── .gitignore
  `

  expect(parser(structure)).toHaveLength(15)
  expect(parser(structure)).toEqual([
    { type: 'folder', path: 'my-project' },
    { type: 'folder', path: 'my-project/.config' },
    { type: 'file', path: 'my-project/.config/tsconfig.json' },
    { type: 'file', path: 'my-project/.config/tsconfig.test.json' },
    { type: 'file', path: 'my-project/.config/vite.config.ts' },
    { type: 'file', path: 'my-project/.config/oxlint.json' },
    { type: 'folder', path: 'my-project/src' },
    { type: 'folder', path: 'my-project/src/sample' },
    { type: 'file', path: 'my-project/src/sample/index.ts' },
    { type: 'file', path: 'my-project/src/sample/index.test.ts' },
    { type: 'file', path: 'my-project/src/index.ts' },
    { type: 'file', path: 'my-project/src/index.test.ts' },
    { type: 'file', path: 'my-project/package.json' },
    { type: 'file', path: 'my-project/README.md' },
    { type: 'file', path: 'my-project/.gitignore' },
  ])
})

test('Complex constrains with paddings', () => {
  const parser = parserFolderStructure
  const structure = `
my-project/
  .config/
    tsconfig.json
    tsconfig.test.json
    vite.config.ts
    oxlint.json

  src/
    sample/
      index.ts
      index.test.ts

    index.ts
    index.test.ts

  package.json
  README.md
  .gitignore
  `

  expect(parser(structure)).toHaveLength(15)
  expect(parser(structure)).toEqual([
    { type: 'folder', path: 'my-project' },
    { type: 'folder', path: 'my-project/.config' },
    { type: 'file', path: 'my-project/.config/tsconfig.json' },
    { type: 'file', path: 'my-project/.config/tsconfig.test.json' },
    { type: 'file', path: 'my-project/.config/vite.config.ts' },
    { type: 'file', path: 'my-project/.config/oxlint.json' },
    { type: 'folder', path: 'my-project/src' },
    { type: 'folder', path: 'my-project/src/sample' },
    { type: 'file', path: 'my-project/src/sample/index.ts' },
    { type: 'file', path: 'my-project/src/sample/index.test.ts' },
    { type: 'file', path: 'my-project/src/index.ts' },
    { type: 'file', path: 'my-project/src/index.test.ts' },
    { type: 'file', path: 'my-project/package.json' },
    { type: 'file', path: 'my-project/README.md' },
    { type: 'file', path: 'my-project/.gitignore' },
  ])
})

test('Complex constrains with subfolders', () => {
  const parser = parserFolderStructure
  const structure = `
my-project/                 # Can
  .config/subconfig/        # be
    tsconfig.json           # commented
    tsconfig.test.json      # with
    vite.config.ts          # extra
    oxlint.json             # advice

  src/subsample/            // js
    sample/                 // comments
      sub/sub/index.ts      // are
      pod/pod/index.test.ts // acceptable

    index.ts
    index.test.ts

package.json
README.md
.gitignore
  `

  expect(parser(structure)).toHaveLength(15)
  expect(parser(structure)).toEqual([
    { type: 'folder', path: 'my-project' },
    { type: 'folder', path: 'my-project/.config/subconfig' },
    { type: 'file', path: 'my-project/.config/subconfig/tsconfig.json' },
    { type: 'file', path: 'my-project/.config/subconfig/tsconfig.test.json' },
    { type: 'file', path: 'my-project/.config/subconfig/vite.config.ts' },
    { type: 'file', path: 'my-project/.config/subconfig/oxlint.json' },
    { type: 'folder', path: 'my-project/src/subsample' },
    { type: 'folder', path: 'my-project/src/subsample/sample' },
    { type: 'file', path: 'my-project/src/subsample/sample/sub/sub/index.ts' },
    { type: 'file', path: 'my-project/src/subsample/sample/pod/pod/index.test.ts' },
    { type: 'file', path: 'my-project/src/subsample/index.ts' },
    { type: 'file', path: 'my-project/src/subsample/index.test.ts' },
    { type: 'file', path: 'package.json' },
    { type: 'file', path: 'README.md' },
    { type: 'file', path: '.gitignore' },
  ])
})

test('Edge cases with empty lines and spaces', () => {
  const parser = parserFolderStructure
  const structure = `
my-project/

  .config/

    tsconfig.json

    tsconfig.test.json

    vite.config.ts

    oxlint.json

  src/

    sample/

      index.ts

      index.test.ts

    index.ts

    index.test.ts

  package.json

  README.md

  .gitignore
  `

  expect(parser(structure)).toHaveLength(15)
  expect(parser(structure)).toEqual([
    { type: 'folder', path: 'my-project' },
    { type: 'folder', path: 'my-project/.config' },
    { type: 'file', path: 'my-project/.config/tsconfig.json' },
    { type: 'file', path: 'my-project/.config/tsconfig.test.json' },
    { type: 'file', path: 'my-project/.config/vite.config.ts' },
    { type: 'file', path: 'my-project/.config/oxlint.json' },
    { type: 'folder', path: 'my-project/src' },
    { type: 'folder', path: 'my-project/src/sample' },
    { type: 'file', path: 'my-project/src/sample/index.ts' },
    { type: 'file', path: 'my-project/src/sample/index.test.ts' },
    { type: 'file', path: 'my-project/src/index.ts' },
    { type: 'file', path: 'my-project/src/index.test.ts' },
    { type: 'file', path: 'my-project/package.json' },
    { type: 'file', path: 'my-project/README.md' },
    { type: 'file', path: 'my-project/.gitignore' },
  ])
})

test('Simple folders', () => {
  const parser = parserFolderStructure

  expect(
    parser(`
aa/
bb/
cc/
  `)
  ).toEqual([
    { type: 'folder', path: 'aa' },
    { type: 'folder', path: 'bb' },
    { type: 'folder', path: 'cc' },
  ])
})

test('Simple files', () => {
  const parser = parserFolderStructure

  expect(
    parser(`
aa
bb
cc
  `)
  ).toEqual([
    { type: 'file', path: 'aa' },
    { type: 'file', path: 'bb' },
    { type: 'file', path: 'cc' },
  ])
})

test('All comment symbols', () => {
  const parser = parserFolderStructure
  const structure = `
my-project/
  src/          # hash comment
    index.ts    // double-slash comment
    index.test.ts <- arrow comment
    README.md   ← unicode arrow comment
  `

  expect(parser(structure)).toHaveLength(5)
  expect(parser(structure)).toEqual([
    { type: 'folder', path: 'my-project' },
    { type: 'folder', path: 'my-project/src' },
    { type: 'file', path: 'my-project/src/index.ts' },
    { type: 'file', path: 'my-project/src/index.test.ts' },
    { type: 'file', path: 'my-project/src/README.md' },
  ])
})

test('Symlinks basic', () => {
  const parser = parserFolderStructure

  expect(parser('link -> target.ts')).toEqual([{ type: 'symlink', path: 'link', target: 'target.ts' }])
  expect(parser('link -> target/')).toEqual([{ type: 'symlink', path: 'link', target: 'target/' }])
})

test('Symlinks in a tree', () => {
  const parser = parserFolderStructure
  const structure = `
my-project/
  src/
    index.ts
    utils -> ../shared/utils.ts
  shared/
    utils.ts
  `

  expect(parser(structure)).toHaveLength(6)
  expect(parser(structure)).toEqual([
    { type: 'folder', path: 'my-project' },
    { type: 'folder', path: 'my-project/src' },
    { type: 'file', path: 'my-project/src/index.ts' },
    { type: 'symlink', path: 'my-project/src/utils', target: '../shared/utils.ts' },
    { type: 'folder', path: 'my-project/shared' },
    { type: 'file', path: 'my-project/shared/utils.ts' },
  ])
})

test('Symlinks edge cases', () => {
  const parser = parserFolderStructure

  // no link name — skip
  expect(parser('-> target.ts')).toHaveLength(0)
  // no target — skip
  expect(parser('link ->')).toHaveLength(0)
  // whitespace-only target — skip
  expect(parser('link ->   ')).toHaveLength(0)
  // multi-arrow: everything after first -> is the target
  expect(parser('link -> a -> b')).toEqual([{ type: 'symlink', path: 'link', target: 'a -> b' }])
})
