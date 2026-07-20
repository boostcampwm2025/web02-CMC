import { Injectable } from '@nestjs/common'
import { ChatMessageParam, BattleTerminatedParam, KafkaPubPort } from '../../../application/ports/out/kafkaPublish.port'
import { ChatEventProducer } from '../../../../kafka/services/chatEventProducer'
import { BattleEventProducer } from '../../../../kafka/services/battleEventProducer'

@Injectable()
export class KafkaAdapter implements KafkaPubPort {
  constructor(
    private readonly battleEventProducer: BattleEventProducer,
    private readonly chatEventProducer: ChatEventProducer,
  ) {}

  //채팅 이벤트
  async publishChat(param: ChatMessageParam): Promise<void> {
    await this.chatEventProducer.publishChatEvent(param)
  }

  //배틀 종료 이벤트
  async publishBattleTerminated(param: BattleTerminatedParam): Promise<void> {
    await this.battleEventProducer.publishBattleEvent(param)
  }
}
