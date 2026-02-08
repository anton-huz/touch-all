#!/usr/bin/env node

import { Args, Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect } from 'effect'
import * as fs from 'fs'
import * as path from 'path'

// Parse the tree structure and extract file/folder paths
const parseTreeStructure = (
  treeString: string
): Array<{ path: string; isFile: boolean }> => {
  const lines = treeString.split('\n').filter((line) => line.trim().length > 0)
  const result: Array<{ path: string; isFile: boolean }> = []
  const pathStack: string[] = []

  for (const line of lines) {
    // Skip the root line if it's just "folder/"
    // if (line.match(/^[\w-]+\/\s*$/)) {
    //   continue;
    // }

    // Remove tree characters (│, ├──, └──, etc.)
    const cleanLine = line.replace(/^[│├└─\s]+/, '').trim()

    if (!cleanLine) continue

    // Count indentation level (number of tree characters before the name)
    const indentMatch = line.match(/^([\s│]*)/)
    const indent = indentMatch ? indentMatch[1].length : 0
    const level = Math.floor(indent / 4)

    // Adjust stack to current level
    pathStack.splice(level)

    // Check if it's a directory (ends with /)
    const isDirectory = cleanLine.endsWith('/')
    const name = cleanLine.replace(/\/$/, '')

    // Build the full path
    pathStack.push(name)
    const fullPath = pathStack.join('/')

    // Skip empty markers like "(empty - ...)"
    if (name.startsWith('(')) {
      pathStack.pop()
      continue
    }

    result.push({
      path: fullPath,
      isFile: !isDirectory,
    })

    // If it's a file, remove it from the stack
    if (!isDirectory) {
      pathStack.pop()
    }
  }

  return result
}

// Create directories and files
const createStructure = (
  items: Array<{ path: string; isFile: boolean }>,
  basePath: string
): Effect.Effect<void, Error> =>
  Effect.gen(function* (_) {
    yield* _(Console.log(`Creating structure in: ${basePath}`))

    for (const item of items) {
      const fullPath = path.join(basePath, item.path)

      if (item.isFile) {
        // Create parent directory if it doesn't exist
        const dir = path.dirname(fullPath)
        yield* _(
          Effect.try({
            try: () => fs.mkdirSync(dir, { recursive: true }),
            catch: (error: unknown) =>
              new Error(`Failed to create directory ${dir}: ${String(error)}`),
          })
        )

        // Create empty file
        yield* _(
          Effect.try({
            try: () => fs.writeFileSync(fullPath, ''),
            catch: (error: unknown) =>
              new Error(`Failed to create file ${fullPath}: ${String(error)}`),
          })
        )
        yield* _(Console.log(`  Created file: ${item.path}`))
      } else {
        // Create directory
        yield* _(
          Effect.try({
            try: () => fs.mkdirSync(fullPath, { recursive: true }),
            catch: (error: unknown) =>
              new Error(
                `Failed to create directory ${fullPath}: ${String(error)}`
              ),
          })
        )
        yield* _(Console.log(`  Created directory: ${item.path}`))
      }
    }

    yield* _(Console.log('\n✓ Structure created successfully!'))
  })

// Define CLI arguments
const treeArg = Args.text({ name: 'tree' }).pipe(
  Args.withDescription(
    'Multiline string representing the directory tree structure'
  )
)

const pathOption = Options.directory('path').pipe(
  Options.withAlias('p'),
  Options.withDefault('.'),
  Options.withDescription('Target folder path (defaults to current directory)')
)

const skipRootOption = Options.boolean('skip-root').pipe(
  Options.withDefault(false),
  Options.withDescription('Skip the top-level directory if there is only one')
)

// Define the command
const command = Command.make('tree-builder', {
  tree: treeArg,
  path: pathOption,
  skipRoot: skipRootOption,
}).pipe(
  Command.withDescription(
    'Create directory structure from a tree representation'
  ),
  Command.withHandler(({ tree, path: targetPath, skipRoot }) =>
    Effect.gen(function* (_) {
      yield* _(Console.log('Parsing tree structure...'))

      let items = parseTreeStructure(tree)

      if (items.length === 0) {
        yield* _(Console.error('No valid items found in the tree structure'))
        yield* _(Console.error(items))
        yield* _(Console.error(tree))
        return yield* _(Effect.fail(new Error('Invalid tree structure')))
      }

      // Skip root if requested and there's only one top-level directory
      if (skipRoot) {
        // Find all top-level items (no "/" in path except trailing)
        const topLevelDirs = items.filter(
          (item) => !item.isFile && !item.path.includes('/')
        )

        if (topLevelDirs.length === 1) {
          const rootDir = topLevelDirs[0].path
          yield* _(Console.log(`Skipping root directory: ${rootDir}/`))

          // Remove the root directory and strip it from all paths
          items = items
            .filter((item) => item.path !== rootDir)
            .map((item) => ({
              ...item,
              path: item.path.startsWith(rootDir + '/')
                ? item.path.slice(rootDir.length + 1)
                : item.path,
            }))
        } else {
          yield* _(
            Console.log(
              'Note: --skip-root has no effect (multiple or no top-level directories found)'
            )
          )
        }
      }

      yield* _(Console.log(`Found ${items.length} items to create\n`))
      yield* _(createStructure(items, targetPath))
    })
  )
)

// Run the CLI
const cli = Command.run(command, {
  name: 'Tree Builder',
  version: '0.0.1',
})

Effect.suspend(() => cli(process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
