// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { test, expect } from 'vitest'
import { parserFolderStructure } from './parser'

test('Basic constrains for parserFolderStructure', () => {
  const parser = parserFolderStructure

  expect(parser('/')).toHaveLength(0)
  expect(parser('demo')).toEqual([{ path: 'demo', isFile: true }])
  expect(parser('demo/')).toSatisfy(Array.isArray)
  expect(parser('demo/')).toEqual([{ path: 'demo', isFile: false }])
  expect(parser('demo/demo/')).toEqual([{ path: 'demo/demo', isFile: false }])
  expect(parser('/demo/demo/')).toEqual([{ path: 'demo/demo', isFile: false }])
  expect(parser('  /demo/demo/')).toEqual([{ path: 'demo/demo', isFile: false }])
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
    {
      'isFile': false,
      'path': 'my-project',
    },
    {
      'isFile': false,
      'path': 'my-project/.config',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/tsconfig.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/tsconfig.test.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/vite.config.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/oxlint.json',
    },
    {
      'isFile': false,
      'path': 'my-project/src',
    },
    {
      'isFile': false,
      'path': 'my-project/src/sample',
    },
    {
      'isFile': true,
      'path': 'my-project/src/sample/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/sample/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/package.json',
    },
    {
      'isFile': true,
      'path': 'my-project/README.md',
    },
    {
      'isFile': true,
      'path': 'my-project/.gitignore',
    },
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
    {
      'isFile': false,
      'path': 'my-project',
    },
    {
      'isFile': false,
      'path': 'my-project/.config',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/tsconfig.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/tsconfig.test.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/vite.config.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/oxlint.json',
    },
    {
      'isFile': false,
      'path': 'my-project/src',
    },
    {
      'isFile': false,
      'path': 'my-project/src/sample',
    },
    {
      'isFile': true,
      'path': 'my-project/src/sample/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/sample/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/package.json',
    },
    {
      'isFile': true,
      'path': 'my-project/README.md',
    },
    {
      'isFile': true,
      'path': 'my-project/.gitignore',
    },
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
    {
      'isFile': false,
      'path': 'my-project',
    },
    {
      'isFile': false,
      'path': 'my-project/.config/subconfig',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/subconfig/tsconfig.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/subconfig/tsconfig.test.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/subconfig/vite.config.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/subconfig/oxlint.json',
    },
    {
      'isFile': false,
      'path': 'my-project/src/subsample',
    },
    {
      'isFile': false,
      'path': 'my-project/src/subsample/sample',
    },
    {
      'isFile': true,
      'path': 'my-project/src/subsample/sample/sub/sub/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/subsample/sample/pod/pod/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/subsample/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/subsample/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'package.json',
    },
    {
      'isFile': true,
      'path': 'README.md',
    },
    {
      'isFile': true,
      'path': '.gitignore',
    },
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
    {
      'isFile': false,
      'path': 'my-project',
    },
    {
      'isFile': false,
      'path': 'my-project/.config',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/tsconfig.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/tsconfig.test.json',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/vite.config.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/.config/oxlint.json',
    },
    {
      'isFile': false,
      'path': 'my-project/src',
    },
    {
      'isFile': false,
      'path': 'my-project/src/sample',
    },
    {
      'isFile': true,
      'path': 'my-project/src/sample/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/sample/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/index.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/src/index.test.ts',
    },
    {
      'isFile': true,
      'path': 'my-project/package.json',
    },
    {
      'isFile': true,
      'path': 'my-project/README.md',
    },
    {
      'isFile': true,
      'path': 'my-project/.gitignore',
    },
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
    {
      'isFile': false,
      'path': 'aa',
    },
    {
      'isFile': false,
      'path': 'bb',
    },
    {
      'isFile': false,
      'path': 'cc',
    },
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
    {
      'isFile': true,
      'path': 'aa',
    },
    {
      'isFile': true,
      'path': 'bb',
    },
    {
      'isFile': true,
      'path': 'cc',
    },
  ])
})
