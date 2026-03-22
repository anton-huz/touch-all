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

