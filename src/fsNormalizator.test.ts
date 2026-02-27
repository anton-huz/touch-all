// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { describe, test, expect } from 'vitest'
import { Effect, Exit, Cause, Option } from 'effect'
import { resolveProjectPathToBase } from './fsNormalizator'
import { PathTraversalError } from './_commonErrors'

describe('safeNormalizePath', () => {
  const res = (a: string, b: string) => Effect.runSync(resolveProjectPathToBase(a, b))

  describe('valid paths within base directory', () => {
    test('root base with root path resolves to /', () => {
      expect(res('/', '/')).toEqual('/')
    })

    test('simple relative child path', () => {
      expect(res('file.txt', '/opt')).toEqual('/opt/file.txt')
    })

    test('nested relative child path', () => {
      expect(res('dir/file.txt', '/opt')).toEqual('/opt/dir/file.txt')
    })

    test('nested relative with traversing', () => {
      expect(res('dir/./path/../../file.txt', '/opt')).toEqual('/opt/file.txt')
    })

    test('absolute path within base is allowed', () => {
      expect(res('/opt/file.txt', '/opt')).toEqual('/opt/opt/file.txt')
    })

    test('absolute project path equal to relative from base dir', () => {
      expect(res('/etc/passwd', '/opt')).toEqual('/opt/etc/passwd')
    })
  })

  describe('path traversal attempts', () => {
    test('single traversal outside base throws', () => {
      expect(() => res('../outside', '/base')).toThrow('project: ../outside')
    })

    test('deep traversal throws', () => {
      expect(() => res('../../etc/passwd', '/opt/app')).toThrow('project: ../../etc/passwd')
    })

    test('traversal failure is PathTraversalError', () => {
      const exit = Effect.runSyncExit(resolveProjectPathToBase('../outside', '/base'))
      expect(Exit.isFailure(exit)).toBe(true)

      const error = Option.getOrNull(Cause.failureOption((exit as Exit.Failure<any, PathTraversalError>).cause))
      expect(error).toBeInstanceOf(PathTraversalError)
    })
  })

  describe('relative basePath', () => {
    test('relative basePath is acceptable', () => {
      expect(res('file.txt', 'relative/path')).toEqual(expect.stringMatching(/relative\/path\/file\.txt$/))
    })

    test('relative projectPath should still respect "project boundary"', () => {
      expect(() => res('../file.txt', 'relative/path/')).toThrow('project: ../file.txt')
    })
  })
})
