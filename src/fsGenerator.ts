// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { FileSystem, Path } from '@effect/platform'
import { Effect } from 'effect'
import { type ParserResult } from './_commonTypes'
import { resolveProjectPathToBase } from './fsNormalizator'

export const fileStructureCreator = (items: ParserResult, basePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    yield* Effect.logInfo(`Creating structure in: ${basePath}`)

    for (const item of items) {
      const fullPath = yield* resolveProjectPathToBase(item.path, basePath)
      const dir = path.dirname(fullPath)

      switch (item.type) {
        case 'file':
          yield* fs.makeDirectory(dir, { recursive: true })
          yield* fs.writeFile(fullPath, new Uint8Array())
          yield* Effect.logInfo(`  Created file:      ${item.path}`)
          break

        case 'symlink':
          yield* fs.makeDirectory(dir, { recursive: true })
          yield* fs.symlink(item.target, fullPath)
          yield* Effect.logInfo(`  Created symlink:   ${item.path} -> ${item.target}`)
          break

        case 'folder':
          yield* fs.makeDirectory(fullPath, { recursive: true })
          yield* Effect.logInfo(`  Created directory: ${item.path}`)
          break
      }
    }

    yield* Effect.logInfo('\n✓ Structure created successfully!')
  })
