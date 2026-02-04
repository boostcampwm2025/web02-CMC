import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { MetricsService } from './metrics.service'

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime()

    res.on('finish', () => {
      const routeInfo = (req as { route?: { path?: unknown } }).route
      const routePath = typeof routeInfo?.path === 'string' ? routeInfo.path : undefined
      const baseUrl = req.baseUrl ?? ''
      const rawPath = routePath ? `${baseUrl}${routePath}` : `${baseUrl}${req.path || req.url || ''}`
      const routeLabel = rawPath ? this.normalizePath(rawPath) : 'unmatched'
      const durationSeconds = this.getDurationSeconds(start)

      this.metricsService.observeHttpRequest(req.method, routeLabel, res.statusCode, durationSeconds)
    })

    next()
  }

  private getDurationSeconds(start: [number, number]) {
    const diff = process.hrtime(start)
    return diff[0] + diff[1] / 1e9
  }

  private normalizePath(path: string) {
    const withoutQuery = path.split('?')[0] || ''
    const normalizedUuid = withoutQuery.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g, ':id')
    return normalizedUuid.replace(/\/\d+(?=\/|$)/g, '/:id')
  }
}
