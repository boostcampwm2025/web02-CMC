import { Injectable } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { ActiveBattleState } from '../types/battles.types'
import { GuestAccount } from '../types/auth.types'
import { BATTLE_TEAM } from '../const/battles.const'
import { generateNickname } from '../service/utils/nickname.util'

@Injectable()
export class GuestBuilder {
  createGuest(nickname: string): GuestAccount {
    const id = this.generateId()

    const guest: GuestAccount = {
      id,
      nickname,
      createdAt: Date.now(),
    }

    return guest
  }

  build(battleState: ActiveBattleState, guest: GuestAccount): void {
    battleState.userInfoMap.set(guest.id, guest.nickname)
    battleState.participants.set(guest.id, BATTLE_TEAM.NONE)
  }

  getNicknameByUserId(state: ActiveBattleState, userId: string): string | null {
    return state.userInfoMap.get(userId) || null
  }

  async generateGuestNickname(
    battleId: string,
    isTaken: (nickname: string) => boolean | Promise<boolean>,
    getBattleState: (battleId: string) => Promise<{ battleState: ActiveBattleState }>,
  ): Promise<string> {
    const maxAttempts = 50
    let attempts = 0

    while (attempts < maxAttempts) {
      const nickname = generateNickname()

      // 배틀 방 내 닉네임 체크 + 외부에서 전달받은 중복 체크 함수 실행
      if (!(await this.isNicknameDuplicate(battleId, nickname, getBattleState)) && !(await isTaken(nickname))) {
        return nickname
      }
      attempts++
    }

    // 최대 시도 횟수 초과 시 숫자 추가하여 강제로 고유하게 만들기
    return `게스트${Date.now() % 10000}`
  }

  async isNicknameDuplicate(
    battleId: string,
    nickname: string,
    getBattleState: (battleId: string) => Promise<{ battleState: ActiveBattleState }>,
  ): Promise<boolean> {
    const { battleState } = await getBattleState(battleId)
    return Array.from(battleState.userInfoMap.values()).some(existingNickname => existingNickname === nickname)
  }

  private generateId(): string {
    return uuidv7()
  }
}
