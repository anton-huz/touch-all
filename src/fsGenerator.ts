// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { Effect } from 'effect'
import path from 'node:path'
import fs from 'node:fs'
import { type ParserResult } from './_commonTypes'
import { resolveProjectPathToBase } from './fsNormalizator'
import { FsError, PathTraversalError } from './_commonErrors'

export const fileStructureCreator = (
  items: ParserResult,
  basePath: string
): Effect.Effect<void, FsError | PathTraversalError> =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Creating structure in: ${basePath}`)

    for (const item of items) {
      const fullPath = yield* resolveProjectPathToBase(item.path, basePath)
      const dir = path.dirname(fullPath)

      switch (item.type) {
        case 'file':
          yield* Effect.try({
            try: () => fs.mkdirSync(dir, { recursive: true }),
            catch: (error) => new FsError(`Failed to create directory ${dir}: ${String(error)}`),
          })
          yield* Effect.try({
            try: () => fs.writeFileSync(fullPath, ''),
            catch: (error) => new FsError(`Failed to create file ${fullPath}: ${String(error)}`),
          })
          yield* Effect.logInfo(`  Created file:      ${item.path}`)
          break

        case 'symlink':
          yield* Effect.try({
            try: () => fs.mkdirSync(dir, { recursive: true }),
            catch: (error) => new FsError(`Failed to create directory ${dir}: ${String(error)}`),
          })
          const symlinkType = item.target.endsWith('/') ? 'dir' : 'file'
          yield* Effect.try({
            try: () => fs.symlinkSync(item.target, fullPath, symlinkType),
            catch: (error) => new FsError(`Failed to create symlink ${fullPath}: ${String(error)}`),
          })
          yield* Effect.logInfo(`  Created symlink:   ${item.path} -> ${item.target}`)
          break

        case 'folder':
        default:
          yield* Effect.try({
            try: () => fs.mkdirSync(fullPath, { recursive: true }),
            catch: (error) => new FsError(`Failed to create directory ${fullPath}: ${String(error)}`),
          })
          yield* Effect.logInfo(`  Created directory: ${item.path}`)
          break
      }
    }

    yield* Effect.logInfo('\n✓ Structure created successfully!')
  })
