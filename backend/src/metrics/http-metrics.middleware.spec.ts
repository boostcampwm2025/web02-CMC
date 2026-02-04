/* eslint-disable @typescript-eslint/unbound-method */
import type { Request, Response } from 'express'
import { HttpMetricsMiddleware } from './http-metrics.middleware'
import type { MetricsService } from './metrics.service'

describe('HttpMetricsMiddleware', () => {
  let middleware: HttpMetricsMiddleware
  let metricsService: jest.Mocked<MetricsService>

  beforeEach(() => {
    metricsService = {
      observeHttpRequest: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>
    middleware = new HttpMetricsMiddleware(metricsService)
  })

  it('next를 호출한다', () => {
    const req = { method: 'GET', baseUrl: '/api', route: { path: '/test' } }
    const res = { on: jest.fn(), statusCode: 200 }
    const next = jest.fn()

    middleware.use(req as unknown as Request, res as unknown as Response, next)
    expect(next).toHaveBeenCalled()
  })

  it('finish 이벤트에서 메트릭을 기록한다', () => {
    const req = { method: 'GET', baseUrl: '/api', route: { path: '/test' } }
    let finishCallback: () => void
    const res = {
      on: jest.fn((event: string, cb: () => void) => {
        if (event === 'finish') finishCallback = cb
      }),
      statusCode: 200,
    }
    const next = jest.fn()

    middleware.use(req as unknown as Request, res as unknown as Response, next)
    finishCallback!()

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith('GET', '/api/test', 200, expect.any(Number))
  })

  it('route가 없으면 "unmatched"로 기록한다', () => {
    const req = { method: 'POST', baseUrl: '' }
    let finishCallback: () => void
    const res = {
      on: jest.fn((event: string, cb: () => void) => {
        if (event === 'finish') finishCallback = cb
      }),
      statusCode: 404,
    }
    const next = jest.fn()

    middleware.use(req as unknown as Request, res as unknown as Response, next)
    finishCallback!()

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith('POST', 'unmatched', 404, expect.any(Number))
  })
})
