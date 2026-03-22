// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

import type { ParserResult } from './types'

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
    const [p03a = '', _comment03] = p02.split('<-')
    const [p03b = '', _comment04] = p03a.split('←')

    // Remove tree characters (│, ├──, └──, etc.)
    const p04 = p03b.replace(/[│├└─\t]/g, ' ')

    const cleanLine = p04.trim().replace(/^\.\//, '')

    if (!cleanLine) continue
    if (cleanLine === '/') continue
    if (cleanLine.endsWith('../')) continue

    const indent = countLeadingSpaces(p04)
    indentSize = indentSize === 0 && indent > 0 ? indent : indentSize
    const level = indentSize === 0 ? 0 : indent / indentSize

    // Adjust stack to current level
    if (previousIndentLevel >= level) {
      pathStack.splice(level, pathStack.length - level)
    }

    previousIndentLevel = level

    // Detect symlink syntax: "link-name -> target"
    const arrowIndex = cleanLine.indexOf('->')
    if (arrowIndex !== -1) {
      const linkName = cleanLine.slice(0, arrowIndex).trim()
      const target = cleanLine.slice(arrowIndex + 2).trim()

      if (!linkName || !target) continue

      const nameParts = linkName.split('/').filter(Boolean)
      pathStack.push(nameParts)
      const path = pathStack.flat().join('/')
      pathStack.pop()

      result.push({ type: 'symlink', path, target })
      continue
    }

    // Check if it's a directory (ends with /) or file
    const isFolder = cleanLine.endsWith('/')
    const name = cleanLine.split('/').filter(Boolean)

    pathStack.push(name)

    const path = pathStack.flat().join('/')

    result.push(isFolder ? { type: 'folder', path } : { type: 'file', path })

    // If it's a file, remove it from the stack
    if (!isFolder) {
      pathStack.pop()
    }
  }

  return result
}

function countLeadingSpaces(str: string) {
  const match = str.match(/^[\s]*/)
  return match ? match[0].length : 0
}
