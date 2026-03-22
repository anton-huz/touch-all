// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { Args, Command, Options } from '@effect/cli'
import { Console, Effect, Logger, LogLevel, Option } from 'effect'
import { fileStructureCreator } from './fsGenerator'
import { parseAndGuardSymlinks } from './symlinkGuard'
import { readStdin } from './stdin'
import packageJson from '../package.json'

const { name, version } = packageJson

// Definition of CLI arguments and options
const treeArg = Args.text({ name: 'tree' }).pipe(
  Args.withDescription('Multiline string representing the directory tree structure'),
  Args.optional
)

const pathOption = Options.directory('path').pipe(
  Options.withAlias('p'),
  Options.withDefault('.'),
  Options.withDescription('Target folder path (defaults to current directory)')
)

const dryRunOption = Options.boolean('dry-run').pipe(
  Options.withAlias('n'),
  Options.withDefault(false),
  Options.withDescription('Parse and validate the tree without writing to the file system')
)

const verboseOption = Options.boolean('verbose').pipe(
  Options.withAlias('v'),
  Options.withDefault(false),
  Options.withDescription('Log to console extra information about creating a directory tree')
)

const yesOption = Options.boolean('yes').pipe(
  Options.withAlias('y'),
  Options.withDefault(false),
  Options.withDescription('Skip confirmation prompt when symlinks point outside the project root')
)

// Declaration of the main command
const command = Command.make(name, {
  tree: treeArg,
  path: pathOption,
  dryRun: dryRunOption,
  verbose: verboseOption,
  yes: yesOption,
}).pipe(
  Command.withDescription('Create directory structure from a tree representation'),
  Command.withHandler(({ tree, path: targetPath, dryRun, verbose, yes }) => {
    const program = Effect.gen(function* () {
      const rawTree = Option.isSome(tree) ? tree.value : yield* readStdin
      const treeString = Option.isSome(tree)
        ? rawTree.replace(/\\(\\|n)/g, (_, c) => (c === 'n' ? '\n' : '\\'))
        : rawTree

      if (dryRun) {
        yield* Effect.logInfo('Dry run: no changes will be made to the file system.')
      }

      yield* Effect.logInfo('Parsing tree structure...')

      const items = yield* parseAndGuardSymlinks(treeString, targetPath, yes)

      if (items.length === 0) {
        yield* Console.error('No valid items found in the tree structure')
        return yield* Effect.fail(new Error('Invalid tree structure'))
      }

      yield* Effect.logInfo(`Found ${items.length} items to create`)
      yield* Effect.logInfo(`Found:\n${items.map((i) => i.path).join('\n')}`)

      if (!dryRun) {
        yield* fileStructureCreator(items, targetPath, { allowOutsideSymlinks: yes })
      }
    })

    return verbose ? program.pipe(Logger.withMinimumLogLevel(LogLevel.Info)) : program
  })
)

// Run the CLI
export const cli = Command.run(command, { name, version })
