# touch-all

CLI tool to create folder structures from markdown tree representations.

Pass a tree string — drawn with box-drawing characters or plain indentation — and `touch-all` creates every directory and file on disk.

## Features

- Accepts tree strings in **box-drawing** (`├──`, `└──`, `│`) or **indentation** (spaces) format
- Trailing `/` marks a directory; no trailing `/` marks a file
- Inline comments stripped automatically (`# ...` and `// ...`)
- `--dry-run` parses and validates without touching the file system
- `--verbose` prints every created path
- Path traversal protection — no item can escape the target directory
- Importable as a Node.js library with full TypeScript types

## Installation

```bash
npm install -g touch-all
```

Or run without installing:

```bash
npx touch-all "..."
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

### Specify target directory

```bash
touch-all "..." --path ./my-project
touch-all "..." -p ./my-project
```

### Dry run — parse and validate, no files created

```bash
touch-all "..." --dry-run
touch-all "..." -n
```

### Verbose output

```bash
touch-all "..." --verbose
touch-all "..." -v
```

### Help

```bash
touch-all --help
```

## Tree Format

Both formats produce identical results.

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

### Rules

| Syntax            | Meaning                          |
| ----------------- | -------------------------------- |
| `name/`           | directory                        |
| `name`            | file                             |
| `dir/sub/`        | directory at an explicit subpath |
| `dir/sub/file.ts` | file at an explicit subpath      |
| `# comment`       | ignored (stripped)               |
| `// comment`      | ignored (stripped)               |

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
  cli,
} from 'touch-all'
import type { ParserResult, ParserResultLineItem } from 'touch-all'
```

### `parserFolderStructure(tree: string): ParserResult`

Parses a tree string into a flat list of `{ path, isFile }` items. Pure function, no I/O.

```ts
const items = parserFolderStructure(`
  src/
    index.ts
`)
// [{ path: 'src', isFile: false }, { path: 'src/index.ts', isFile: true }]
```

### `fileStructureCreator(items: ParserResult, basePath: string): Effect<void, FsError | PathTraversalError>`

Creates the parsed structure on disk under `basePath`. Returns an [Effect](https://effect.website/).

```ts
import { Effect } from 'effect'
import { NodeContext, NodeRuntime } from '@effect/platform-node'

const items = parserFolderStructure(tree)

fileStructureCreator(items, '/absolute/target/path').pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
```

### `resolveProjectPathToBase(projectPath: string, basePath: string): Effect<string, PathTraversalError>`

Resolves `projectPath` relative to `basePath` and rejects any path that would escape `basePath` (path traversal protection).

### Error types

| Class                | `_tag`                 | When thrown                                                     |
| -------------------- | ---------------------- | --------------------------------------------------------------- |
| `PathTraversalError` | `'PathTraversalError'` | Resolved path escapes `basePath`, or `basePath` is not absolute |
| `FsError`            | `'FsError'`            | `mkdirSync` or `writeFileSync` fails                            |

## License

[GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html)
