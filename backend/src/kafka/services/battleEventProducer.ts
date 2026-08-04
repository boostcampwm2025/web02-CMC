import { Injectable, Logger } from '@nestjs/common'
import { KafkaConfigService } from '../kafka.config'
import { CompressionTypes, Producer } from 'kafkajs'
import { KAFKA_TOPIC } from '../kafka.const'
import type { BattleEvent } from '../events/battleEvent'

@Injectable()
export class BattleEventProducer {
  private producer: Producer
  private readonly logger = new Logger(BattleEventProducer.name)

  constructor(private readonly kafkaConfigService: KafkaConfigService) {
    this.producer = this.kafkaConfigService.getClient().producer()
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect()
    this.logger.log('Kafka Producer connected successfully.')
  }

  async publishBattleEvent(event: BattleEvent): Promise<void> {
    await this.send(KAFKA_TOPIC.BATTLE_EVENTS, event.battleId, JSON.stringify(event))
  }

  private async send(topic: string, key: string, message: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: message }],
        compression: CompressionTypes.GZIP,
        acks: -1,
      })
      this.logger.log(`[Battle Kafka] 메시지 전송 완료:  ${topic} | ${message}`)
    } catch (error) {
      this.logger.error(`[Battle Kafka Error] 메시지 전송 실패: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect()
    this.logger.log('Kafka Producer disconnected successfully.')
  }
}
