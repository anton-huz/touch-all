// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Anton Huz <anton@ahuz.dev>

export type ParserResultLineItem =
  | { type: 'file'; path: string }
  | { type: 'folder'; path: string }
  | { type: 'symlink'; path: string; target: string }

export type ParserResult = Array<ParserResultLineItem>
