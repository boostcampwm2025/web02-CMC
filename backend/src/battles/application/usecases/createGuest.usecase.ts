import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import type { GuestAccount } from '../../domains/models/types/auth.types'
import { BATTLE_STATE_PORT, BATTLE_IDENTIFIER_PORT, GUEST_CHECK_PORT } from '../ports/tokens'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleIdentifierPort } from '../ports/out/battleIdentifier.port'
import type { GuestCheckPort } from '../ports/out/guestCheck.port'
import { BattleGuestService } from '../../domains/services/battleGuest/battleGuest.service'

@Injectable()
export class CreateGuestUseCase {
  constructor(
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_IDENTIFIER_PORT) private readonly identifierPort: BattleIdentifierPort,
    @Inject(GUEST_CHECK_PORT) private readonly guestCheckPort: GuestCheckPort,
    private readonly guestService: BattleGuestService,
  ) {}

  /**
   * 게스트 생성
   */
  async execute(battleId: string): Promise<GuestAccount> {
    const { state } = await this.stateRepo.loadBattleState(battleId)
    if (state.status === BATTLE_STATUS.CLOSED) {
      throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')
    }

    const guestNickname = await this.guestService.buildGuestNickname(
      battleId,
      nickname => this.guestCheckPort.isNicknameExists(nickname),
      (battleId, nickname) => this.stateRepo.isNicknameDuplicate(battleId, nickname),
    )

    const guest: GuestAccount = this.guestService.buildGuest(guestNickname, () => this.identifierPort.generateId())

    this.guestService.applyGuestToState(state, guest)
    this.stateRepo.saveBattleState(battleId, state)

    return guest
  }
}
