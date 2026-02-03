import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common'
import { BATTLE_STATUS, BATTLE_PLAYTIME } from '../models/const/battles.const'
import { BattleResultResponseDto } from '../../dto/battleResult.dto'
import { BattleJoinInfoResponseDto } from '../../dto/battleJoinResponse.dto'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_UTIL_PORT } from '../../application/ports/tokens'
import type { BattleRepoPort } from '../../application/ports/out/battleRepository.port'
import type { BattleStatePort } from '../../application/ports/out/battleState.port'
import type { BattleUtilPort } from '../../application/ports/out/battleUtil.port'
import type { ActiveBattleState } from '../models/types/battle.types'
import { BattleResultService } from './battleResult.service'
import { BattleTimelineService } from './battleTimeline.service'
import { BattleMvpService } from './battleMvp.service'

@Injectable()
export class BattleQueryService {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_UTIL_PORT) private readonly utilPort: BattleUtilPort,
    private readonly resultService: BattleResultService,
    private readonly timelineService: BattleTimelineService,
    private readonly mvpService: BattleMvpService,
  ) {}

  //비공개 배틀 확인
  async isPrivateBattle(battleId: string): Promise<boolean> {
    const battle = await this.repo.findUnique(battleId)
    return battle.isPrivate
  }

  //열린 배틀 목록 조회
  async getOpenBattles(limit: number, offset: number): Promise<{ battles: unknown[]; meta: { offset: number; limit: number; total: number } }> {
    const [records, total] = await Promise.all([
      this.repo.findBattleList({
        onlyPublic: true,
        status: { in: [BATTLE_STATUS.OPEN, BATTLE_STATUS.PENDING] },
        limit,
        offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.repo.countBattleList({
        onlyPublic: true,
        status: { in: [BATTLE_STATUS.OPEN, BATTLE_STATUS.PENDING] },
      }),
    ])

    const battles = this.utilPort.buildOpenBattleList(records)

    return {
      battles,
      meta: { offset, limit, total },
    }
  }

  //닫힌 배틀 목록 조회
  async getClosedBattles(limit: number, offset: number): Promise<{ battles: unknown[]; meta: { offset: number; limit: number; total: number } }> {
    const [records, total] = await Promise.all([
      this.repo.findBattleList({
        status: BATTLE_STATUS.CLOSED,
        limit,
        offset,
        orderBy: { finishedAt: 'desc' },
      }),
      this.repo.countBattleList({
        status: BATTLE_STATUS.CLOSED,
      }),
    ])

    const battles = this.utilPort.buildClosedBattleList(records, this.resultService)

    return {
      battles,
      meta: { offset, limit, total },
    }
  }

  //배틀 결과 조회
  async getBattleResult(battleId: string): Promise<BattleResultResponseDto> {
    const battle = await this.repo.findUnique(battleId)
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('배틀이 아직 진행 중입니다.')
    }

    const teamACount = battle.teamACount ?? 0
    const teamBCount = battle.teamBCount ?? 0
    const totalParticipants = battle.totalParticipantsCount ?? teamACount + teamBCount
    const timeline = this.timelineService.toTimeline(battle.timeline as unknown)
    const result = this.resultService.buildBattleResult(teamACount, teamBCount, battle.totalParticipantsCount, battle.winningTeam)

    const dto = new BattleResultResponseDto()
    dto.battleId = battle.id
    dto.authorId = battle.userId
    dto.title = battle.title
    dto.description = battle.description
    dto.status = 'CLOSED'
    dto.language = battle.language
    dto.category = battle.category
    const playTimeKey = battle.playTime as keyof typeof BATTLE_PLAYTIME
    dto.playTime = BATTLE_PLAYTIME[playTimeKey]?.time ?? 0
    dto.topics = battle.topics
    dto.createdAt = battle.createdAt.toISOString()
    dto.finishedAt = battle.finishedAt ? battle.finishedAt.toISOString() : (battle.updatedAt?.toISOString() ?? battle.createdAt.toISOString())
    dto.codeA = battle.codeA
    dto.codeB = battle.codeB
    dto.result = result
    dto.metrics = {
      totalParticipants,
      totalViews: totalParticipants,
      strategiesCount: timeline.length,
      totalChats: 0,
    }
    dto.voteTimeline = [
      {
        turn: 1,
        teamAVotes: teamACount,
        teamBVotes: teamBCount,
        neutralVotes: Math.max(totalParticipants - teamACount - teamBCount, 0),
        timestamp: dto.finishedAt,
      },
    ]
    dto.timeline = timeline
    const mvpsState = this.stateRepo.parseMvpsState(battle.mvpsState as unknown)
    dto.mvps = mvpsState.length > 0 ? mvpsState : this.mvpService.buildLegacyMvpsFromNicknames(battle.mvps ?? [], timeline)

    return dto
  }

  //초대 코드로 배틀 조회
  async getBattleByInviteCode(inviteCode: string): Promise<{ battleId: string }> {
    if (!inviteCode) throw new BadRequestException('초대 코드가 필요합니다.')

    const battle = await this.repo.findUniqueByInviteCode(inviteCode)

    if (!battle) {
      throw new NotFoundException('잘못된 초대 코드입니다.')
    }

    if (battle.status === BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('이미 종료된 배틀입니다.')
    }

    return { battleId: battle.id }
  }

  //배틀 참가 정보 조회
  async getJoinBattleInfo(battleId: string): Promise<BattleJoinInfoResponseDto> {
    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const battle = await this.repo.findUnique(battleId)
    let activeBattleState: ActiveBattleState | undefined
    let participantCount = battle.totalParticipantsCount ?? 0
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      const loaded = await this.stateRepo.loadBattleState(battleId)
      activeBattleState = loaded.state
      participantCount = loaded.state.participants.size
    }

    const mapped = this.utilPort.toBattleEntity(battle, participantCount)
    return BattleJoinInfoResponseDto.of(mapped, activeBattleState)
  }
}
