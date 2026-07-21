import { Injectable } from '@nestjs/common'
import { Kafka, logLevel } from 'kafkajs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class KafkaConfigService {
  private kafka: Kafka

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'web02-cmc-backend',
      brokers: [configService.get<string>('KAFKA_BOOTSTRAP_SERVERS') || 'localhost:29092'],
      logLevel: logLevel.INFO,
    })
  }

  getClient(): Kafka {
    return this.kafka
  }
}
