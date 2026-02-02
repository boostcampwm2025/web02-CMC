import { Injectable, NotFoundException } from '@nestjs/common'
import type { GuestAccount } from '../types/auth.types'
import { BATTLE_STATUS } from '../const/battles.const'
import { BattleStateRepository } from '../infra/battleState.repository'
import { BattleUtil } from '../infra/battle.util'
import { GuestBuilder } from '../guest/guest.builder'

@Injectable()
export class GuestService {
  constructor(
    private readonly stateRepository: BattleStateRepository,
    private readonly battleUtil: BattleUtil,
    private readonly guestBuilder: GuestBuilder,
  ) {}

  async handleGuest(battleId: string, isTaken: (nickname: string) => boolean | Promise<boolean>): Promise<GuestAccount> {
    const { battle, state: battleState } = await this.stateRepository.loadBattleState(battleId)
    if (battle.status === BATTLE_STATUS.CLOSED) {
      throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')
    }

    const guestNickname = await this.guestBuilder.generateGuestNickname(battleId, isTaken, async battleId => {
      const loaded = await this.stateRepository.loadBattleState(battleId)
      return { battleState: loaded.state }
    })
    const guest: GuestAccount = {
      id: this.battleUtil.generateId(),
      nickname: guestNickname,
      createdAt: Date.now(),
    }

    this.guestBuilder.build(battleState, guest)
    await this.stateRepository.saveBattleState(battleId, battleState)

    return guest
  }
}
