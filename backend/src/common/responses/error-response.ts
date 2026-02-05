export class ErrorResponse {
  public readonly statusCode: number
  public readonly message: string
  public readonly error: string
  public readonly path: string
  public readonly timestamp: string
  public readonly details?: string[]

  constructor(statusCode: number, message: string, error: string, path: string, details?: string[]) {
    this.statusCode = statusCode
    this.message = message
    this.error = error
    this.path = path
    this.timestamp = new Date().toISOString()
    this.details = details
  }
}
