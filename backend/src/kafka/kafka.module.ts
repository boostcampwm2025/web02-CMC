import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { KafkaConfigService } from './kafka.config'
import { ChatEventProducer } from './services/chatEventProducer'
import { BattleEventProducer } from './services/battleEventProducer'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [KafkaConfigService, ChatEventProducer, BattleEventProducer],
  exports: [KafkaConfigService, ChatEventProducer, BattleEventProducer],
})
export class KafkaModule {}
