import { Injectable, BadRequestException } from '@nestjs/common'
import { ActiveBattleState, BattleChat, BattleTeam } from '../types/battles.types'
import { BATTLE_CHAT_SCOPE, BATTLE_TEAM } from '../const/battles.const'

@Injectable()
export class BattleChatHandler {
  //채팅 메시지 생성
  createChatMessage(
    messageId: string,
    userId: string,
    nickname: string,
    tier: string | undefined,
    team: BattleTeam | undefined,
    text: string,
  ): BattleChat {
    return {
      messageId,
      team: team as BattleTeam,
      sender: {
        userId,
        nickname,
        tier,
      },
      text: text.trim(),
      createdAt: new Date(),
    } as BattleChat
  }

  handleChatMessage(battleState: ActiveBattleState, chat: BattleChat, scope: string, team?: BattleTeam): void {
    if (scope === BATTLE_CHAT_SCOPE.ALL) {
      battleState.all.chats.push(chat)
      return
    }

    if (!team) {
      throw new BadRequestException('진영 채팅은 team 값이 필요합니다.')
    }

    if (team !== BATTLE_TEAM.A && team !== BATTLE_TEAM.B) {
      throw new BadRequestException('진영 채팅은 A/B 진영만 사용할 수 있습니다.')
    }

    const target = team === BATTLE_TEAM.A ? battleState.teamA : battleState.teamB
    target.chats.push(chat)
  }
}
