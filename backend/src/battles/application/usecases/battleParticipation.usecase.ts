import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { BATTLE_STATUS } from '../../domains/models/const/battles.const'
import { BattleJoinRequestDto } from '../../dto/battleJoinRequest.dto'
import { BattleLeaveResponseDto } from '../../dto/battleLeaveResponse.dto'
import { BattleUserUpdateResponseDto, type TeamCounts } from '../../dto/battleUserUpdateResponse.dto'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_BROADCASTER_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { ActiveBattleState, BattleTeam } from '../../domains/models/types/battle.types'
import { BattleTeamSwitchService } from '../../domains/services/battleTeamSwitch/battleTeamSwitch.service'
import { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'

@Injectable()
export class BattleParticipationUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_BROADCASTER_PORT) private readonly broadcaster: BattleBroadcasterPort,
    private readonly teamSwitchService: BattleTeamSwitchService,
    private readonly phaseTransitionUseCase: BattlePhaseTransitionUseCase,
  ) {}

  /**
   * 배틀 참가
   */
  async join(battleJoinRequestDto: BattleJoinRequestDto, userId: string): Promise<{ battleState: ActiveBattleState; team: BattleTeam }> {
    const battleId: string = String(battleJoinRequestDto.battleId)
    const team: BattleTeam = battleJoinRequestDto.team
    const nickname: string = String(battleJoinRequestDto.nickname)
    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const { state } = await this.stateRepo.loadBattleState(battleId)
    if (state.status === BATTLE_STATUS.CLOSED) throw new BadRequestException('이미 종료된 배틀입니다.')

    const existingTeam = state.participants.get(userId)
    const userExists = await this.repo.findUniqueUser(userId, { id: true, tier: true })
    if (!state.userInfoMap.has(userId)) {
      state.userInfoMap.set(userId, userExists?.tier ? { nickname, tier: userExists.tier } : nickname)
    }

    if (!existingTeam || existingTeam !== team) {
      this.teamSwitchService.applyParticipant(state, userId, team, (battleId: string, counts: TeamCounts) => {
        this.broadcaster.emitUserUpdated(BattleUserUpdateResponseDto.of(battleId, counts))
      })
    }

    if (userExists) {
      await this.repo.upsertBattleParticipant({ userId, battleId, team: String(team), isMvp: false })
    }

    this.stateRepo.saveBattleState(battleId, state)
    return { battleState: state, team }
  }

  //배틀 나가기
  async leave(userId: string, battleId: string): Promise<BattleLeaveResponseDto> {
    if (!userId || !battleId) throw new BadRequestException('유효하지 않은 요청입니다.')

    const { state } = await this.stateRepo.loadBattleState(battleId)
    state.teamA.users = state.teamA.users.filter((id: string) => id !== userId)
    state.teamB.users = state.teamB.users.filter((id: string) => id !== userId)
    state.teamVotes.delete(userId)
    state.participants.delete(userId)
    state.skipState.delete(userId)

    this.stateRepo.saveBattleState(battleId, state)
    await this.phaseTransitionUseCase.checkAndSkipPhase(battleId, state)

    return BattleLeaveResponseDto.of(state)
  }
}
