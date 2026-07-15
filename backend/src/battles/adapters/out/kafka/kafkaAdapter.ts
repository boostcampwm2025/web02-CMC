import { Injectable } from '@nestjs/common'
import { ChatMessageParam, KafkaPubPort } from '../../../application/ports/out/kafkaPublish.port'
import { ChatEventProducer } from '../../../../kafka/services/chatEventProducer'

@Injectable()
export class KafkaAdapter implements KafkaPubPort {
  constructor(
    // private readonly battleEventProducer: BattleEventProducer,
    private readonly chatEventProducer: ChatEventProducer,
  ) {}

  //채팅 이벤트
  async publishChat(param: ChatMessageParam): Promise<void> {
    await this.chatEventProducer.publishChatEvent({
      battleId: param.battleId,
      messageId: param.messageId,
      team: param.team,
      sender: param.sender,
      text: param.text,
      createdAt: param.createdAt,
    })
  }

  //배틀 이벤트
}
