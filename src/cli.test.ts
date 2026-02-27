// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { Effect } from 'effect'
import { NodeContext } from '@effect/platform-node'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cli } from './cli'

const run = (args: string[]) =>
  Effect.runPromise(cli(['node', 'touch-all', ...args]).pipe(Effect.provide(NodeContext.layer)))

describe('touch-all CLI', () => {
  describe('--dry-run', () => {
    test('succeeds with a valid tree without touching the file system', async () => {
      await expect(run(['--dry-run', 'src/\n  index.ts'])).resolves.toBeUndefined()
    })

    test('fails with a root-only tree that produces no items', async () => {
      await expect(run(['--dry-run', '/'])).rejects.toBeDefined()
    })
  })

  describe('file system creation', () => {
    let tmpDir: string

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'touch-all-test-'))
    })

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    test('creates expected directories and files at target path', async () => {
      await run(['--path', tmpDir, 'src/\n  index.ts'])

      expect(fs.existsSync(path.join(tmpDir, 'src'))).toBe(true)
      expect(fs.existsSync(path.join(tmpDir, 'src', 'index.ts'))).toBe(true)
    })

    test('creates nested directory structure', async () => {
      const tree = 'my-project/\n  src/\n    index.ts\n  README.md'
      await run(['--path', tmpDir, tree])

      expect(fs.existsSync(path.join(tmpDir, 'my-project', 'src'))).toBe(true)
      expect(fs.existsSync(path.join(tmpDir, 'my-project', 'src', 'index.ts'))).toBe(true)
      expect(fs.existsSync(path.join(tmpDir, 'my-project', 'README.md'))).toBe(true)
    })

    test('dry-run does not create any files', async () => {
      await run(['--path', tmpDir, '--dry-run', 'src/\n  index.ts'])

      expect(fs.existsSync(path.join(tmpDir, 'src'))).toBe(false)
    })
  })
})
