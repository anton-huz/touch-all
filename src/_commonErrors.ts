/**
 * Error type for path traversal detection
 */
export class PathTraversalError {
  readonly _tag = 'PathTraversalError'
  constructor(public readonly path: string) {}
  toString() {
    return `${this._tag}: The path cannot be used ${this.path}`
  }
}

/**
 * Error type for file system operation failures
 */
export class FsError {
  readonly _tag = 'FsError'
  constructor(public readonly message: string) {}
  toString() {
    return `${this._tag}: ${this.message}`
  }
}
