import { MetricsService } from './metrics.service'

describe('MetricsService', () => {
  let service: MetricsService

  beforeEach(() => {
    service = new MetricsService()
  })

  describe('contentType', () => {
    it('Prometheus 콘텐츠 타입을 반환한다', () => {
      expect(service.contentType).toContain('text/plain')
    })
  })

  describe('getMetrics', () => {
    it('메트릭 문자열을 반환한다', async () => {
      const metrics = await service.getMetrics()
      expect(typeof metrics).toBe('string')
      expect(metrics.length).toBeGreaterThan(0)
    })
  })

  describe('observeHttpRequest', () => {
    it('HTTP 요청 메트릭을 기록한다', async () => {
      service.observeHttpRequest('GET', '/api/test', 200, 0.05)
      const metrics = await service.getMetrics()
      expect(metrics).toContain('http_request_duration_seconds')
      expect(metrics).toContain('http_requests_total')
    })
  })

  describe('startSocketTimer', () => {
    it('소켓 이벤트 타이머를 생성하고 종료한다', async () => {
      const end = service.startSocketTimer('test:event')
      end('success')
      const metrics = await service.getMetrics()
      expect(metrics).toContain('socket_event_duration_seconds')
      expect(metrics).toContain('socket_events_total')
    })

    it('에러 상태일 때 에러 카운터를 증가시킨다', async () => {
      const end = service.startSocketTimer('test:event')
      end('error')
      const metrics = await service.getMetrics()
      expect(metrics).toContain('socket_event_errors_total')
    })
  })

  describe('setActiveSocketConnections', () => {
    it('활성 소켓 연결 수를 설정한다', async () => {
      service.setActiveSocketConnections(42)
      const metrics = await service.getMetrics()
      expect(metrics).toContain('socket_active_connections')
    })
  })
})
