import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class CustomGlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomGlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // HTTP 예외인 경우
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      // Validation 에러 처리 (message가 배열인 경우)
      let message: string
      let details: string[] | undefined

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const msg = (exceptionResponse as { message: unknown }).message
        if (Array.isArray(msg)) {
          message = '입력 값이 올바르지 않습니다.'
          details = msg
        } else {
          message = String(msg)
        }
      } else {
        message = exception.message
      }

      // HTTP 예외 로깅 (5xx는 error, 4xx는 warn)
      const logMessage = `[${request.method}] ${request.url} - ${status} ${message}`
      if (status >= 500) {
        this.logger.error(logMessage, exception.stack)
      } else {
        this.logger.warn(logMessage)
      }

      response.status(status).json({
        statusCode: status,
        message,
        error: HttpStatus[status],
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        path: request.url,
      })
      return
    }

    // 예상치 못한 에러 (Error 객체가 아닌 경우 포함)
    const errorMessage = exception instanceof Error ? exception.message : String(exception)
    const errorStack = exception instanceof Error ? exception.stack : undefined
    this.logger.error(`[${request.method}] ${request.url} - 500 ${errorMessage}`, errorStack)

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 내부 오류가 발생했습니다.',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
