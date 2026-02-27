// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { resolve, relative, sep } from 'node:path'
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
): Effect.Effect<string, PathTraversalError> => {
  const filePath = projectPath.startsWith(sep) ? `.${projectPath}` : projectPath
  const absolute = resolve(basePath, filePath)
  const rel = relative(basePath, absolute)

  if (rel.startsWith('..')) {
    return Effect.fail(new PathTraversalError(['project:', projectPath, 'base:', basePath].join(' ')))
  }

  return Effect.succeed(absolute)
}
