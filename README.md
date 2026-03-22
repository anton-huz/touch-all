# touch-all

CLI tool to create folder structures from Markdown tree representations.

![](.media/terminal-sceen-cast.svg)

It behaves like `mkdir -p` and `touch` combined, creating directories and files as needed. It can be used to quickly scaffold a project structure or generate placeholder files.

## Features

- Accepts tree strings in **box-drawing** (`├──`, `└──`, `│`) or **indentation** (spaces) format
- Trailing slash `/` marks a directory; no trailing `/` marks a file
- Inline comments stripped automatically (`# ...`, `// ...`, `<- ...`, `← ...`)
- Symlink creation with `link-name -> target` syntax
- `--dry-run` parses and validates without touching the file system
- Prints a summary line on success (`✓ Done. N items created.`); `--verbose` adds per-item detail
- Path traversal protection — no file, folder, or symlink target can escape the target directory
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

- `--verbose` , `-v` – prints every created path to the console. Useful for seeing exactly what will be created, especially with complex structures. By default only a summary line is printed on success (`✓ Done. N items created.`). `--verbose` adds per-item detail.

```bash
touch-all "..." --verbose
touch-all "..." -v
```

- `--yes` , `-y` – skips the confirmation prompt when symlinks point outside the project root. Required in non-interactive environments (scripts, CI).

```bash
touch-all "..." --yes
touch-all "..." -y
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
| `... #  comment`  | ignored (stripped)               |
| `... // comment`  | ignored (stripped)               |
| `... <- comment`  | ignored (stripped)               |
| `... ←  comment`  | ignored (stripped)               |
| `name -> target`  | symlink pointing to `target`     |

Items at the root level (no indentation / no parent) are created directly inside the target directory.

### Symlinks

Use `link-name -> target` to create a symlink. The target is passed as-is to the OS — use paths relative to the symlink's location, just as you would in a shell.

```
my-project/
├─ src/
│  ├─ index.ts
│  └─ utils -> ../shared/utils.ts   # symlink to a sibling directory
└─ shared/
   └─ utils.ts
```

If `target` ends with `/`, the symlink is created as a directory symlink (relevant on Windows). The link name's suffix is ignored.

> [!WARNING]
> If any symlink target resolves outside the project root (`--path`), `touch-all` will prompt for confirmation before proceeding. Use `--yes` to skip the prompt in scripts or CI.
>
> When using `fileStructureCreator` directly as a library, outside-root symlinks are rejected by default with a `PathTraversalError`. Pass `{ allowOutsideSymlinks: true }` as the third argument to allow them.

## Library API

```bash
npm install touch-all
```

```ts
import {
  parserFolderStructure,
  fileStructureCreator,
  resolveProjectPathToBase,
  isSymlinkOutsideRoot,
  PathTraversalError,
} from 'touch-all'
import type { ParserResult, ParserResultLineItem } from 'touch-all'
```

### `parserFolderStructure(tree: string): ParserResult`

Parses a tree string into a flat list of items. Pure function, no I/O.

Each item is one of:

```ts
type ParserResultLineItem =
  | { type: 'file'; path: string }
  | { type: 'folder'; path: string }
  | { type: 'symlink'; path: string; target: string }
```

```ts
const items = parserFolderStructure(`
  src/
    index.ts
    link -> ../shared.ts
`)
// [
//   { type: 'folder',  path: 'src' },
//   { type: 'file',    path: 'src/index.ts' },
//   { type: 'symlink', path: 'src/link', target: '../shared.ts' },
// ]
```

### `fileStructureCreator(items, basePath, options?): Effect<void, PathTraversalError>`

Creates the parsed structure on disk under `basePath`. Returns an [Effect](https://effect.website/).

By default, symlinks whose targets resolve outside `basePath` are rejected with `PathTraversalError`. Pass `{ allowOutsideSymlinks: true }` to allow them.

```ts
import { Effect } from 'effect'
import { NodeContext, NodeRuntime } from '@effect/platform-node'

const projectDirectory = '/absolute/target/path'
const items = parserFolderStructure(tree)

// Default: outside-root symlinks are rejected
fileStructureCreator(items, projectDirectory).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)

// Opt out of symlink containment check
fileStructureCreator(items, projectDirectory, { allowOutsideSymlinks: true }).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
```

### `isSymlinkOutsideRoot(linkPath, target, basePath, path): boolean`

Pure function that returns `true` if a symlink target resolves outside `basePath`. Useful for pre-validating items before passing them to `fileStructureCreator`.

```ts
import { Path } from '@effect/platform'
import { Effect } from 'effect'
import { NodeContext } from '@effect/platform-node'
import { isSymlinkOutsideRoot } from 'touch-all'

Effect.gen(function* () {
  const path = yield* Path.Path
  const outside = isSymlinkOutsideRoot('src/link', '../../etc/passwd', '/project', path)
  // true — target escapes /project
}).pipe(Effect.provide(NodeContext.layer))
```

### `resolveProjectPathToBase(projectPath: string, basePath: string): Effect<string, PathTraversalError>`

Resolves `projectPath` relative to `basePath` and rejects any path that would escape `basePath` (path traversal protection).

> [!WARNING]
> `projectPath` cannot traverse outside of `basePath`. If `projectPath` is absolute, it treated as relative to `basePath`. If `projectPath` is relative, it is resolved against `basePath`. In either case, if the resulting path is outside of `basePath`, a `PathTraversalError` is thrown.

### Error types

| Class                | `_tag`                 | When thrown                                                                |
| -------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `PathTraversalError` | `'PathTraversalError'` | A file/folder path or symlink target escapes `basePath` (unless opted out) |

## License

[GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html)
