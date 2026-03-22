// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { Path } from '@effect/platform'
import { Effect } from 'effect'
import { PathTraversalError } from './_commonErrors'

/**
 * Safely normalize a user-supplied path against a base directory.
 * Fails with PathTraversalError if the resolved path escapes the base.
 *
 * @param projectPath string - Path relative to project.
 * @param basePath string - Must be absolute.
 */
export const resolveProjectPathToBase = (
  projectPath: string,
  basePath: string
): Effect.Effect<string, PathTraversalError, Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path

    const filePath = projectPath.startsWith(path.sep) ? `.${projectPath}` : projectPath
    const absolute = path.resolve(basePath, filePath)
    const rel = path.relative(basePath, absolute)

    if (rel.startsWith('..')) {
      return yield* Effect.fail(new PathTraversalError(['project:', projectPath, 'base:', basePath].join(' ')))
    }

    return absolute
  })
