import { Injectable, Logger } from '@nestjs/common'
import { KafkaConfigService } from '../kafka.config'
import { CompressionTypes, Producer } from 'kafkajs'
import { KAFKA_TOPIC } from '../kafka.const'
import type { ChatEvent } from '../events/chatEvent'

@Injectable()
export class ChatEventProducer {
  private producer: Producer
  private readonly logger = new Logger(ChatEventProducer.name)

  constructor(private readonly kafkaConfigService: KafkaConfigService) {
    this.producer = this.kafkaConfigService.getClient().producer()
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect()
    this.logger.log('Kafka Chat Producer connected successfully.')
  }

  async publishChatEvent(event: ChatEvent): Promise<void> {
    await this.send(KAFKA_TOPIC.BATTLE_CHAT_EVENTS, event.battleId, JSON.stringify(event))
  }

  private async send(topic: string, key: string, message: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: message }],
        compression: CompressionTypes.ZSTD,
        acks: -1,
      })
      this.logger.log(`[Chat Kafka] 메시지 전송 완료:  ${topic} | ${message}`)
    } catch (error) {
      this.logger.error(`[Chat Kafka Error] 메시지 전송 실패: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect()
    this.logger.log('Kafka Chat Producer disconnected successfully.')
  }
}
