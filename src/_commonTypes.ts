// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

export interface ParserResultLineItem {
  path: string
  isFile: boolean
}

export type ParserResult = Array<ParserResultLineItem>
