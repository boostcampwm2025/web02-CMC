export class RedisThrottlerStorageError extends Error {
  constructor(message: string, options: { cause?: unknown }) {
    super(message, options)
    this.name = 'RedisThrottlerStorageError'
    this.cause = options?.cause
  }
}
