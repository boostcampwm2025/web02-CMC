import { Injectable } from '@nestjs/common'
import { ActiveBattleState } from '../models/types/battle.types'
import { BATTLE_TEAM } from '../models/const/battles.const'
import type { GuestAccount } from '../models/types/auth.types'
import { generateNickname } from './utils/nickname.util'

@Injectable()
export class BattleGuestService {
  //게스트 계정 생성
  buildGuest(nickname: string, generateId: () => string): GuestAccount {
    const id = generateId()

    const guest: GuestAccount = {
      id,
      nickname,
      createdAt: Date.now(),
    }

    return guest
  }

  //배틀 상태에 게스트 추가
  applyGuestToState(battleState: ActiveBattleState, guest: GuestAccount): void {
    battleState.userInfoMap.set(guest.id, guest.nickname)
    battleState.participants.set(guest.id, BATTLE_TEAM.NONE)
  }

  //게스트 닉네임 생성
  async buildGuestNickname(
    battleId: string,
    isTaken: (nickname: string) => boolean | Promise<boolean>,
    isNicknameDuplicate: (battleId: string, nickname: string) => Promise<boolean>,
  ): Promise<string> {
    const maxAttempts = 50
    let attempts = 0

    while (attempts < maxAttempts) {
      const nickname = generateNickname()

      // 배틀 방 내 닉네임 체크 + 외부에서 전달받은 중복 체크 함수 실행
      if (!(await isNicknameDuplicate(battleId, nickname)) && !(await isTaken(nickname))) {
        return nickname
      }
      attempts++
    }

    // 최대 시도 횟수 초과 시 숫자 추가하여 강제로 고유하게 만들기
    return `게스트${Date.now() % 10000}`
  }
}
