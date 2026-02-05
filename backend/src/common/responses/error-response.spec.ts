import { ErrorResponse } from './error-response'

describe('ErrorResponse', () => {
  describe('생성자', () => {
    it('기본 속성들이 올바르게 설정된다', () => {
      const response = new ErrorResponse(400, '잘못된 요청', 'Bad Request', '/api/test')

      expect(response.statusCode).toBe(400)
      expect(response.message).toBe('잘못된 요청')
      expect(response.error).toBe('Bad Request')
      expect(response.path).toBe('/api/test')
      expect(response.timestamp).toBeDefined()
      expect(response.details).toBeUndefined()
    })

    it('details가 있는 경우 포함된다', () => {
      const details = ['에러1', '에러2']
      const response = new ErrorResponse(400, '입력 오류', 'Bad Request', '/api/test', details)

      expect(response.details).toEqual(details)
    })

    it('timestamp가 ISO 형식이다', () => {
      const response = new ErrorResponse(500, '서버 오류', 'Internal Server Error', '/api/test')

      const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      expect(response.timestamp).toMatch(isoDatePattern)
    })
  })

  describe('다양한 HTTP 상태 코드', () => {
    it('404 응답을 생성한다', () => {
      const response = new ErrorResponse(404, '찾을 수 없음', 'Not Found', '/api/users/999')

      expect(response.statusCode).toBe(404)
      expect(response.error).toBe('Not Found')
    })

    it('401 응답을 생성한다', () => {
      const response = new ErrorResponse(401, '인증 필요', 'Unauthorized', '/api/protected')

      expect(response.statusCode).toBe(401)
      expect(response.error).toBe('Unauthorized')
    })

    it('500 응답을 생성한다', () => {
      const response = new ErrorResponse(500, '서버 내부 오류', 'Internal Server Error', '/api/crash')

      expect(response.statusCode).toBe(500)
      expect(response.error).toBe('Internal Server Error')
    })
  })
})
