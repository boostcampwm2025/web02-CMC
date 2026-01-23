import { Controller, Get, Res } from '@nestjs/common'
import type { Response } from 'express'
import { MetricsService } from './metrics.service'

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', this.metricsService.contentType)
    res.send(await this.metricsService.getMetrics())
  }
}
