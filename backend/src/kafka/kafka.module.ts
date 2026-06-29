import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { KafkaConfigService } from './kafka.config'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [KafkaConfigService],
  exports: [KafkaConfigService],
})
export class KafkaModule {}
