import { Injectable } from '@nestjs/common'
import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client'

type SocketStatus = 'success' | 'error'

@Injectable()
export class MetricsService {
  private readonly registry = new Registry()
  private readonly httpRequestDuration: Histogram<'method' | 'route' | 'status_code'>
  private readonly httpRequestCount: Counter<'method' | 'route' | 'status_code'>
  private readonly socketEventDuration: Histogram<'event' | 'status'>
  private readonly socketEventCount: Counter<'event' | 'status'>
  private readonly socketEventErrors: Counter<'event'>
  private readonly socketActiveConnections: Gauge<'scope'>
  private readonly socketConnectionEvents: Counter<'type'>
  private readonly serviceActionDuration: Histogram<'action' | 'status'>

  constructor() {
    collectDefaultMetrics({ register: this.registry })

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    })

    this.httpRequestCount = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    })

    this.socketEventDuration = new Histogram({
      name: 'socket_event_duration_seconds',
      help: 'Socket event handling duration in seconds',
      labelNames: ['event', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
      registers: [this.registry],
    })

    this.socketEventCount = new Counter({
      name: 'socket_events_total',
      help: 'Total number of socket events',
      labelNames: ['event', 'status'],
      registers: [this.registry],
    })

    this.socketEventErrors = new Counter({
      name: 'socket_event_errors_total',
      help: 'Total number of socket event errors',
      labelNames: ['event'],
      registers: [this.registry],
    })

    this.socketActiveConnections = new Gauge({
      name: 'socket_active_connections',
      help: 'Active socket connections',
      labelNames: ['scope'],
      registers: [this.registry],
    })

    this.socketConnectionEvents = new Counter({
      name: 'socket_connection_events_total',
      help: 'Total socket connection events',
      labelNames: ['type'],
      registers: [this.registry],
    })

    this.serviceActionDuration = new Histogram({
      name: 'service_action_duration_seconds',
      help: 'Service action duration in seconds',
      labelNames: ['action', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    })
  }

  get contentType() {
    return this.registry.contentType
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics()
  }

  observeHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number) {
    const labels = {
      method,
      route,
      status_code: String(statusCode),
    }
    this.httpRequestDuration.observe(labels, durationSeconds)
    this.httpRequestCount.inc(labels)
  }

  startSocketTimer(event: string) {
    const start = process.hrtime()
    return (status: SocketStatus) => {
      const durationSeconds = this.getDurationSeconds(start)
      this.socketEventDuration.observe({ event, status }, durationSeconds)
      this.socketEventCount.inc({ event, status })
      if (status === 'error') {
        this.socketEventErrors.inc({ event })
      }
    }
  }

  setActiveSocketConnections(count: number) {
    this.socketActiveConnections.set({ scope: 'user' }, count)
  }

  incSocketConnectionEvent(type: 'connect' | 'disconnect' | 'connect_error') {
    this.socketConnectionEvents.inc({ type })
  }

  startServiceTimer(action: string) {
    const start = process.hrtime()
    return (status: SocketStatus) => {
      const durationSeconds = this.getDurationSeconds(start)
      this.serviceActionDuration.observe({ action, status }, durationSeconds)
    }
  }

  private getDurationSeconds(start: [number, number]) {
    const diff = process.hrtime(start)
    return diff[0] + diff[1] / 1e9
  }
}
