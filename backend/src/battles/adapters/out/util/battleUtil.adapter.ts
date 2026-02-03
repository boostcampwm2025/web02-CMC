import { Injectable, BadRequestException } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { Battle } from '../../../domains/models/types/battle.types'
import { BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_TYPE } from '../../../domains/models/const/battles.const'
import type { BattlePlayTimeName, BattleLanguage, BattleCategory, BattleStatus } from '../../../domains/models/types/battle.types'
import type { BattleReferenceData } from '../../../domains/models/types/ai.types'
import { BattleUtilPort } from '../../../application/ports/out/battleUtil.port'
import { BattleResponseDto } from '../../../dto/battleResponse.dto'
import { ClosedBattleResponseDto } from '../../../dto/closedBattleResponse.dto'
import { BattleResultService } from '../../../domains/services/battleResult.service'

@Injectable()
export class BattleUtilAdapter implements BattleUtilPort {
  constructor(private readonly resultService: BattleResultService) {}

  generateId(): string {
    return uuidv7()
  }

  generateInviteCode(): string {
    // 밀리초 단위 타임스탬프 기반 코드 생성
    return Date.now().toString()
  }

  shuffleTopics(topics: string[], playTime: string): string[] {
    const rounds = BATTLE_PLAYTIME[playTime as BattlePlayTimeName]?.rounds
    if (!rounds) throw new BadRequestException('올바르지 않은 배틀 진행 시간입니다.')
    if (topics.length !== rounds) throw new BadRequestException('대주제의 개수가 라운드 수와 일치하지 않습니다.')

    const shuffled = [...topics]
    if (topics.length === 1) return shuffled

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    return shuffled
  }

  toBattleEntity(
    record: {
      id: string
      userId: string
      title: string
      description: string
      codeA: string
      codeB: string
      language: string
      category: string
      playTime: string
      topics: string[]
      inviteCode: string | null
      isPrivate: boolean
      status: string
      createdAt: Date
      updatedAt: Date | null
      referenceData?: unknown
    },
    participantCount: number,
  ): Battle {
    const playTime = BATTLE_PLAYTIME[record.playTime as BattlePlayTimeName]
    if (!playTime) {
      throw new BadRequestException('올바르지 않은 배틀 진행 시간입니다.')
    }

    return {
      id: record.id,
      authorId: record.userId,
      title: record.title,
      description: record.description,
      aCode: record.codeA,
      bCode: record.codeB,
      language: record.language as BattleLanguage,
      type: record.isPrivate ? BATTLE_TYPE.PRIVATE : BATTLE_TYPE.PUBLIC,
      category: record.category as BattleCategory,
      playTime,
      topics: record.topics,
      inviteCode: record.inviteCode ?? undefined,
      status: record.status as BattleStatus,
      participantCount,
      initialState: {
        round: 1,
        phase: BATTLE_PHASE.OPINION_SHARE.name,
        phaseCount: 1,
        timeRemainingSeconds: playTime.time * 60,
      },
      referenceData: record.referenceData as BattleReferenceData | null | undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? record.createdAt,
    }
  }

  buildOpenBattleList(records: unknown[]): unknown[] {
    const battles = (
      records as Array<{
        id: string
        userId: string
        title: string
        description: string
        codeA: string
        codeB: string
        language: string
        category: string
        playTime: string
        topics: string[]
        inviteCode: string | null
        isPrivate: boolean
        status: string
        createdAt: Date
        updatedAt: Date | null
        referenceData?: unknown
      }>
    ).map(battle => this.toBattleEntity(battle, 0))

    return BattleResponseDto.of(battles)
  }

  buildClosedBattleList(records: unknown[], resultBuilder: unknown): unknown[] {
    const resultService = resultBuilder as BattleResultService
    const battles = (
      records as Array<{
        id: string
        userId: string
        title: string
        description: string
        codeA: string
        codeB: string
        language: string
        category: string
        playTime: string
        topics: string[]
        inviteCode: string | null
        isPrivate: boolean
        status: string
        createdAt: Date
        updatedAt: Date | null
        teamACount: number | null
        teamBCount: number | null
        totalParticipantsCount: number | null
        winningTeam: string | null
        referenceData?: unknown
      }>
    ).map(record => {
      const teamACount = record.teamACount ?? 0
      const teamBCount = record.teamBCount ?? 0
      const result = resultService.buildBattleResult(teamACount, teamBCount, record.totalParticipantsCount, record.winningTeam)
      const battle = this.toBattleEntity(record, record.totalParticipantsCount ?? teamACount + teamBCount)

      return ClosedBattleResponseDto.of(battle, result)
    })

    return battles
  }

  getBattleRoomId(battleId: string, team?: string): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }
}
