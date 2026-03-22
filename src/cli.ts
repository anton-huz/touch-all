// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import { createInterface } from 'node:readline'
import { Args, Command, Options } from '@effect/cli'
import { Path, Terminal } from '@effect/platform'
import { Console, Effect, Logger, LogLevel, Option } from 'effect'
import { parserFolderStructure } from './parser'
import { fileStructureCreator } from './fsGenerator'
import pkgjsn from '../package.json'

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
const command = Command.make('touch-all', {
  tree: treeArg,
  path: pathOption,
  dryRun: dryRunOption,
  verbose: verboseOption,
  yes: yesOption,
}).pipe(
  Command.withDescription('Create directory structure from a tree representation'),
  Command.withHandler(({ tree, path: targetPath, dryRun = false, verbose, yes }) => {
    const readStdin = Effect.gen(function* () {
      if (process.stdin.isTTY) {
        yield* Console.log('Paste your tree structure and press Ctrl+D when done:')
      }
      return yield* Effect.tryPromise({
        try: () =>
          new Promise<string>((resolve) => {
            const rl = createInterface({ input: process.stdin })
            const lines: string[] = []
            rl.on('line', (line) => lines.push(line))
            rl.on('close', () => resolve(lines.join('\n')))
          }),
        catch: (e) => new Error(`Failed to read stdin: ${String(e)}`),
      })
    })

    const checkOutsideSymlinks = (treeString: string, projectRoot: string) =>
      Effect.gen(function* () {
        const nodePath = yield* Path.Path
        const items = parserFolderStructure(treeString)
        const resolvedRoot = nodePath.resolve(projectRoot)

        const outsideSymlinks = items
          .filter((item) => item.type === 'symlink')
          .filter((item) => {
            const symlinkDir = nodePath.resolve(resolvedRoot, nodePath.dirname(item.path))
            const resolvedTarget = nodePath.resolve(symlinkDir, item.target)
            return nodePath.relative(resolvedRoot, resolvedTarget).startsWith('..')
          })

        if (outsideSymlinks.length === 0) return items

        if (yes) return items

        if (!process.stdin.isTTY) {
          yield* Console.error(
            `Cannot prompt in non-interactive mode: tree contains symlinks outside PROJECT_ROOT (${resolvedRoot}). Use --yes to proceed.`
          )
          return yield* Effect.fail(new Error('Non-interactive mode with outside symlinks'))
        }

        const listing = outsideSymlinks
          .map((item) => `  ${item.path} -> ${item.type === 'symlink' ? item.target : ''}`)
          .join('\n')

        yield* Console.log(`Warning: the following symlinks point outside PROJECT_ROOT (${resolvedRoot}):\n${listing}`)

        const terminal = yield* Terminal.Terminal
        yield* terminal.display('Proceed? (y/N) ')

        const answer = yield* terminal.readLine.pipe(Effect.catchTag('QuitException', () => Effect.succeed('')))

        if (answer.trim().toLowerCase() !== 'y') {
          yield* Console.log('Aborted.')
          return yield* Effect.fail(new Error('Aborted by user'))
        }

        return items
      })

    const program = Effect.gen(function* () {
      const treeString = Option.isSome(tree) ? tree.value : yield* readStdin

      if (dryRun) {
        yield* Effect.logInfo('Running in dry mode. No one file system node will be created.')
      }
      yield* Effect.logInfo('Parsing tree structure...')

      const items = yield* checkOutsideSymlinks(treeString, targetPath)

      if (items.length === 0) {
        yield* Console.error('No valid items found in the tree structure')
        return yield* Effect.fail(new Error('Invalid tree structure'))
      }

      yield* Effect.logInfo(`Found ${items.length} items to create`)
      yield* Effect.logInfo(`Found: \n${items.map((i) => `${i.path} \n`).join('')}`)

      if (!dryRun) {
        yield* fileStructureCreator(items, targetPath)
      }
    })

    return verbose ? program.pipe(Logger.withMinimumLogLevel(LogLevel.Info)) : program
  })
)

// Run the CLI
export const cli = Command.run(command, {
  name: pkgjsn.name,
  version: pkgjsn.version,
})
