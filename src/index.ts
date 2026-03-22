// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

export { fileStructureCreator } from './fsGenerator'
export { isSymlinkOutsideRoot, resolveProjectPathToBase } from './fsNormalizator'
export { PathTraversalError } from './_commonErrors'
export type { ParserResult, ParserResultLineItem } from './_commonTypes'
export { parserFolderStructure } from './parser'
