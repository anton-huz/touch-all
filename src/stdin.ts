// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { createInterface } from 'node:readline'
import { Effect } from 'effect'

export const readStdin = Effect.tryPromise({
  try: () =>
    new Promise<string>((resolve) => {
      const rl = createInterface({ input: process.stdin })
      const lines: string[] = []
      rl.on('line', (line) => lines.push(line))
      rl.on('close', () => resolve(lines.join('\n')))
    }),
  catch: (e) => new Error(`Failed to read stdin: ${String(e)}`),
})
