import { ArgumentsHost, HttpStatus, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CustomGlobalExceptionFilter } from './custom-global-exception.filter'

describe('CustomGlobalExceptionFilter', () => {
  let filter: CustomGlobalExceptionFilter
  let mockResponse: { status: jest.Mock; json: jest.Mock }
  let mockRequest: { method: string; url: string }
  let mockHost: ArgumentsHost

  beforeEach(() => {
    filter = new CustomGlobalExceptionFilter()

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    mockRequest = {
      method: 'GET',
      url: '/test/path',
    }

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost
  })

  describe('HTTP 예외 처리', () => {
    it('NotFoundException을 처리한다', () => {
      const exception = new NotFoundException('리소스를 찾을 수 없습니다.')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: '리소스를 찾을 수 없습니다.',
          error: 'NOT_FOUND',
          path: '/test/path',
        }),
      )
    })

    it('InternalServerErrorException을 처리한다', () => {
      const exception = new InternalServerErrorException('서버 오류')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류',
          error: 'INTERNAL_SERVER_ERROR',
        }),
      )
    })

    it('BadRequestException을 처리한다', () => {
      const exception = new BadRequestException('잘못된 요청입니다.')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: '잘못된 요청입니다.',
        }),
      )
    })
  })

  describe('Validation 에러 처리', () => {
    it('message가 배열인 경우 details로 분리한다', () => {
      const validationErrors = ['필드1이 필요합니다.', '필드2가 올바르지 않습니다.']
      const exception = new BadRequestException({ message: validationErrors })

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: '입력 값이 올바르지 않습니다.',
          details: validationErrors,
        }),
      )
    })

    it('message가 문자열인 경우 그대로 사용한다', () => {
      const exception = new BadRequestException({ message: '단일 에러 메시지' })

      filter.catch(exception, mockHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '단일 에러 메시지',
        }),
      )
    })
  })

  describe('예상치 못한 에러 처리', () => {
    it('일반 Error 객체를 500으로 처리한다', () => {
      const exception = new Error('예상치 못한 에러')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 내부 오류가 발생했습니다.',
          error: 'Internal Server Error',
        }),
      )
    })

    it('Error 객체가 아닌 예외도 처리한다', () => {
      const exception = 'string error'

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 내부 오류가 발생했습니다.',
        }),
      )
    })
  })

  describe('응답 형식', () => {
    it('timestamp가 포함된다', () => {
      const exception = new NotFoundException('테스트')

      filter.catch(exception, mockHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      )
    })

    it('path가 요청 URL과 일치한다', () => {
      mockRequest.url = '/api/battles/123'
      const exception = new NotFoundException('테스트')

      filter.catch(exception, mockHost)

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/battles/123',
        }),
      )
    })
  })
})
