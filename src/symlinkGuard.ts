// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { Path, Terminal } from '@effect/platform'
import { Console, Effect } from 'effect'
import { type ParserResult } from './types'
import { parserFolderStructure } from './parser'
import { isSymlinkOutsideRoot } from './fsNormalizator'

export const parseAndGuardSymlinks = (
  treeString: string,
  projectRoot: string,
  yes: boolean
): Effect.Effect<ParserResult, Error, Path.Path | Terminal.Terminal> =>
  Effect.gen(function* () {
    const nodePath = yield* Path.Path
    const items = parserFolderStructure(treeString)
    const resolvedRoot = nodePath.resolve(projectRoot)

    const symlinks = items.filter(
      (item): item is Extract<(typeof items)[number], { type: 'symlink' }> => item.type === 'symlink'
    )
    const outsideSymlinks = symlinks.filter((item) =>
      isSymlinkOutsideRoot(item.path, item.target, resolvedRoot, nodePath)
    )

    if (outsideSymlinks.length === 0) return items

    if (yes) return items

    const listing = outsideSymlinks.map((item) => `  ${item.path} -> ${item.target}`).join('\n')

    yield* Console.error(`Warning: the following symlinks point outside PROJECT_ROOT (${resolvedRoot}):\n${listing}`)

    const terminal = yield* Terminal.Terminal
    yield* terminal.display('Proceed? (y/N) ')

    const answer = yield* terminal.readLine.pipe(
      Effect.catchTag('QuitException', () =>
        Effect.fail(new Error(`Non-interactive mode: use --yes to allow symlinks outside project root`))
      )
    )

    if (answer.trim().toLowerCase() !== 'y') {
      yield* Console.error('Aborted.')
      return yield* Effect.fail(new Error('Aborted by user'))
    }

    return items
  })
