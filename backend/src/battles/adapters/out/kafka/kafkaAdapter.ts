import { Injectable } from '@nestjs/common'
import {
  ChatMessageParam,
  BattleCreatedParam,
  BattlePhaseChangedParam,
  BattleTerminatedParam,
  KafkaPubPort,
} from '../../../application/ports/out/kafkaPublish.port'
import { ChatEventProducer } from '../../../../kafka/services/chatEventProducer'
import { BattleEventProducer } from '../../../../kafka/services/battleEventProducer'

const EVENT_TYPE = {
  CREATED: 'battle.created',
  PHASE_CHANGED: 'battle.phase_changed',
  FINISHED: 'battle.finished',
} as const

type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

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

  //배틀 생성 이벤트
  async publishBattleCreated(param: BattleCreatedParam): Promise<void> {
    await this.sendBattleEvent(EVENT_TYPE.CREATED, param)
  }

  //phase 전환 이벤트
  async publishBattlePhaseChanged(param: BattlePhaseChangedParam): Promise<void> {
    await this.sendBattleEvent(EVENT_TYPE.PHASE_CHANGED, param)
  }

  //배틀 종료 이벤트
  async publishBattleTerminated(param: BattleTerminatedParam): Promise<void> {
    await this.sendBattleEvent(EVENT_TYPE.FINISHED, param)
  }

  private async sendBattleEvent(type: EventType, param: object): Promise<void> {
    await this.battleEventProducer.publishBattleEvent({
      type,
      ...param,
    } as Parameters<BattleEventProducer['publishBattleEvent']>[0])
  }
}
