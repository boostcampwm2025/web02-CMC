import type { Response } from 'express'
import { MetricsController } from './metrics.controller'
import type { MetricsService } from './metrics.service'

describe('MetricsController', () => {
  let controller: MetricsController
  let metricsService: jest.Mocked<MetricsService>

  beforeEach(() => {
    metricsService = {
      contentType: 'text/plain; version=0.0.4; charset=utf-8',
      getMetrics: jest.fn().mockResolvedValue('# HELP test metric\ntest_total 1'),
    } as unknown as jest.Mocked<MetricsService>
    controller = new MetricsController(metricsService)
  })

  describe('getMetrics', () => {
    it('메트릭을 반환하고 Content-Type을 설정한다', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      }

      await controller.getMetrics(mockRes as unknown as Response)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
      expect(mockRes.send).toHaveBeenCalledWith('# HELP test metric\ntest_total 1')
    })
  })
})
