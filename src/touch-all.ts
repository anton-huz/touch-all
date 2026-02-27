// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { Effect, Logger, LogLevel } from 'effect'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { cli } from './cli'

Effect.suspend(() => cli(process.argv)).pipe(
  Logger.withMinimumLogLevel(LogLevel.Warning),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
