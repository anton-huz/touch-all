# touch-all

CLI tool to create folder structures from Markdown tree representations.

![](.media/terminal-sceen-cast.svg)

It behaves like `mkdir -p` and `touch` combined, creating directories and files as needed. It can be used to quickly scaffold a project structure or generate placeholder files.

## Features

- Accepts tree strings in **box-drawing** (`├──`, `└──`, `│`) or **indentation** (spaces) format
- Trailing slash `/` marks a directory; no trailing `/` marks a file
- Inline comments stripped automatically (`# ...` and `// ...`)
- `--dry-run` parses and validates without touching the file system
- `--verbose` prints every created path
- Path traversal protection — no item can escape the target directory
- Importable as a Node.js library with full TypeScript types

## Installation

```bash
npm install -g touch-all
```

or with `npx` without installing:

```bash
npx touch-all@latest "..."
```

## Usage

### Basic (current directory)

```bash
touch-all "
my-project/
├── src/
│   ├── index.ts
│   └── index.test.ts
├── package.json
└── README.md
"
```

## Arguments

- `--path` , `-p` – specifies target directory. By default, the current working directory is used. Can be an absolute path or a path relative to the current working directory.

```bash
touch-all "..." --path=./my-project
touch-all "..." -p ~/Documents/my-project
```

- `--dry-run` , `-n` – parses and validates the tree string without creating any files or directories. Useful for testing and debugging.

```bash
touch-all "..." --dry-run
touch-all "..." -n
```

- `--verbose` , `-v` – prints every created path to the console. Useful for seeing exactly what will be created, especially with complex structures. It's an alias for `--log-level info`

```bash
touch-all "..." --verbose
touch-all "..." -v
```

- `--completions` – generates a completion script for a specific shell. Supported shells: `sh`, `bash`, `fish`, `zsh`.
- `--log-level` – sets the minimum log level for a command. Supported levels: `all`, `trace`, `debug`, `info`, `warning`, `error`, `fatal`, `none`. The default log level is `warning`.
- `--help` , `-h` – shows the help documentation for a command.
- `--wizard` – starts wizard mode for a command, providing an interactive step-by-step interface.
- `--version` – shows the version of the application.

## Tree Format

### Box-drawing characters

```
my-project/
├── .config/
│   ├── tsconfig.json
│   └── vite.config.ts
├── src/
│   ├── index.ts
│   └── index.test.ts
├── package.json
└── README.md
```

### Indentation (spaces)

```
my-project/
  .config/
    tsconfig.json
    vite.config.ts
  src/
    index.ts
    index.test.ts
  package.json
  README.md
```

Both formats produce identical results.


### Rules

| Syntax            | Meaning                          |
|-------------------| -------------------------------- |
| `name/`           | directory                        |
| `name`            | file                             |
| `dir/sub/`        | directory at an explicit subpath |
| `dir/sub/file.ts` | file at an explicit subpath      |
| `... # comment`   | ignored (stripped)               |
| `... // comment`  | ignored (stripped)               |

Items at the root level (no indentation / no parent) are created directly inside the target directory.

## Library API

```bash
npm install touch-all
```

```ts
import {
  parserFolderStructure,
  fileStructureCreator,
  resolveProjectPathToBase,
  PathTraversalError,
  FsError,
} from 'touch-all'
import type { ParserResult, ParserResultLineItem } from 'touch-all'
```

### `parserFolderStructure(tree: string): ParserResult`

Parses a tree string into a flat list of `type ParserResult = { path: string, isFile: boolean }` items. Pure function, no I/O.

```ts
const items = parserFolderStructure(`
  src/
    index.ts
`)
// [
//    {
//      path: 'src',
//      isFile: false
//     }, {
//      path: 'src/index.ts',
//      isFile: true
//     }
// ]
```

### `fileStructureCreator(items: ParserResult, basePath: string): Effect<void, FsError | PathTraversalError>`

Creates the parsed structure on disk under `basePath`. Returns an [Effect](https://effect.website/).

```ts
import { Effect } from 'effect'
import { NodeContext, NodeRuntime } from '@effect/platform-node'

const projectDirectory = '/absolute/target/path'
const items = parserFolderStructure(tree)

fileStructureCreator(items, projectDirectory)
  .pipe(
    Effect.provide(NodeContext.layer),
    NodeRuntime.runMain,
  )
```

### `resolveProjectPathToBase(projectPath: string, basePath: string): Effect<string, PathTraversalError>`

Resolves `projectPath` relative to `basePath` and rejects any path that would escape `basePath` (path traversal protection).

> [!CAUTION]
> `projectPath` cannot traverse outside of `basePath`. If `projectPath` is absolute, it treated as relative to `basePath`. If `projectPath` is relative, it is resolved against `basePath`. In either case, if the resulting path is outside of `basePath`, a `PathTraversalError` is thrown.


### Error types

| Class                | `_tag`                 | When thrown                                                     |
| -------------------- | ---------------------- | --------------------------------------------------------------- |
| `PathTraversalError` | `'PathTraversalError'` | Resolved path escapes `basePath`, or `basePath` is not absolute |
| `FsError`            | `'FsError'`            | `mkdirSync` or `writeFileSync` fails                            |

## License

[GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html)
