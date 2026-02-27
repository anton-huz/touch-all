// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import type { ParserResult } from './_commonTypes'

export const parserFolderStructure = (treeString: string): ParserResult => {
  const lines = treeString.split('\n')
  const result: ParserResult = []
  const pathStack: string[][] = []
  let indentSize = 0
  let previousIndentLevel = 0

  for (const line of lines) {
    // Remove line comments
    const [p01 = '', _comment01] = line.split('#')
    const [p02 = '', _comment02] = p01.split('//')

    // Remove tree characters (│, ├──, └──, etc.)
    const p03 = p02.replace(/[│├└─\s]/g, ' ')

    const cleanLine = p03.trim()

    if (!cleanLine) continue
    if (cleanLine === '/') continue
    if (cleanLine.startsWith('./')) continue
    if (cleanLine.endsWith('../')) continue

    const indent = countLeadingSpaces(p03)
    indentSize = indentSize === 0 && indent > 0 ? indent : indentSize
    const level = indentSize === 0 ? 0 : indent / indentSize

    // Adjust stack to current level
    if (previousIndentLevel > level) {
      pathStack.splice(level, previousIndentLevel - level)
    }

    previousIndentLevel = level

    // Check if it's a directory (ends with /)
    const isFile = !cleanLine.endsWith('/')
    const name = cleanLine.split('/').filter(Boolean)

    pathStack.push(name)

    const path = pathStack.flat().join('/')

    result.push({
      path,
      isFile,
    })

    // If it's a file, remove it from the stack
    if (isFile) {
      pathStack.pop()
    }
  }

  return result
}

function countLeadingSpaces(str: string) {
  const match = str.match(/^[\s]*/)
  return match ? match[0].length : 0
}
