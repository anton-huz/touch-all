# Tree Builder CLI

A TypeScript CLI tool built on `@effect/cli` that creates directory structures from tree-like string representations.

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic usage (current directory)

```bash
tsx tree-builder.ts "
boot/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── publish.yml
│       └── security.yml
├── src/
│   ├── index.ts
│   └── templates/
│       └── index.ts
├── package.json
└── README.md
"
```

### Specify target directory

```bash
tsx tree-builder.ts "
boot/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── publish.yml
│       └── security.yml
├── src/
│   ├── index.ts
│   └── templates/
│       └── index.ts
├── package.json
└── README.md
" --path ./my-project
```

Or using the short form:

```bash
tsx tree-builder.ts "..." -p ./my-project
```

### Skip root directory

If your tree has a single top-level directory that you want to skip:

```bash
tsx tree-builder.ts "
boot/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── index.ts
└── package.json
" --skip-root
```

This will create `.github/`, `src/`, and `package.json` directly in the target directory, without creating a `boot/` folder.

You can combine options:

```bash
tsx tree-builder.ts "..." --path ./my-project --skip-root
```

### After building

```bash
node dist/tree-builder.js "..." --path ./output
```

## Features

- ✅ Parses ASCII tree structures with various tree characters (├──, └──, │)
- ✅ Creates directories and empty files
- ✅ Supports nested structures
- ✅ Optional target directory (defaults to current directory)
- ✅ Skip root directory option (--skip-root) for single top-level directories
- ✅ Built on Effect ecosystem for type-safe functional programming

## Tree Format

The tool recognizes:

- Directories: end with `/` (e.g., `src/`)
- Files: no trailing `/` (e.g., `index.ts`)
- Tree characters: `├──`, `└──`, `│` (automatically stripped)
- Comments in parentheses: `(empty - ...)` (ignored)

## Example

Input:

```
my-app/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   └── index.ts
└── package.json
```

Creates:

```
my-app/
  src/
    components/
      Button.tsx (empty file)
    index.ts (empty file)
  package.json (empty file)
```

## Help

```bash
tsx tree-builder.ts --help
```
