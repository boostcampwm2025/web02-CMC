import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { MetricsService } from './metrics.service'

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime()

    res.on('finish', () => {
      const route = (req as { route?: { path?: unknown } }).route
      const routePath = typeof route?.path === 'string' ? route.path : undefined
      const baseUrl = req.baseUrl ?? ''
      const route = routePath ? `${baseUrl}${routePath}` : 'unmatched'
      const durationSeconds = this.getDurationSeconds(start)

      this.metricsService.observeHttpRequest(req.method, route, res.statusCode, durationSeconds)
    })

    next()
  }

  private getDurationSeconds(start: [number, number]) {
    const diff = process.hrtime(start)
    return diff[0] + diff[1] / 1e9
  }
}
