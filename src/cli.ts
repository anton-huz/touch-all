// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { Args, Command, Options } from '@effect/cli'
import { Console, Effect, Logger, LogLevel } from 'effect'
import { parserFolderStructure } from './parser'
import { fileStructureCreator } from './fsGenerator'

// Define CLI arguments
const treeArg = Args.text({ name: 'tree' }).pipe(
  Args.withDescription('Multiline string representing the directory tree structure')
)

const pathOption = Options.directory('path').pipe(
  Options.withAlias('p'),
  Options.withDefault('.'),
  Options.withDescription('Target folder path (defaults to current directory)')
)

const dryRunOption = Options.boolean('dry-run').pipe(
  Options.withAlias('n'),
  Options.withDefault(false),
  Options.withDescription('Skip the top-level directory if there is only one')
)

const verboseOption = Options.boolean('verbose').pipe(
  Options.withAlias('v'),
  Options.withDefault(false),
  Options.withDescription('Log to console extra information about creating a directory tree')
)

// Define the command
const command = Command.make('touch-all', {
  tree: treeArg,
  path: pathOption,
  dryRun: dryRunOption,
  verbose: verboseOption,
}).pipe(
  Command.withDescription('Create directory structure from a tree representation'),
  Command.withHandler(({ tree, path: targetPath, dryRun = false, verbose }) => {
    const program = Effect.gen(function* (_) {
      if (dryRun) {
        yield* _(Effect.logInfo('Running in dry mode. No one file system node will be created.'))
      }
      yield* _(Effect.logInfo('Parsing tree structure...'))

      const items = parserFolderStructure(tree)

      if (items.length === 0) {
        yield* _(Console.error('No valid items found in the tree structure'))
        yield* _(Console.error(items))
        yield* _(Console.error(tree))
        return yield* _(Effect.fail(new Error('Invalid tree structure')))
      }

      yield* _(Effect.logInfo(`Found ${items.length} items to create`))
      yield* _(Effect.logInfo(`Found: \n${items.map((i) => `${i.path} \n`).join('')}`))

      if (!dryRun) {
        yield* _(fileStructureCreator(items, targetPath))
      }
    })

    return verbose ? program.pipe(Logger.withMinimumLogLevel(LogLevel.Info)) : program
  })
)

// Run the CLI
export const cli = Command.run(command, {
  name: 'Touch All',
  version: '0.0.1',
})
