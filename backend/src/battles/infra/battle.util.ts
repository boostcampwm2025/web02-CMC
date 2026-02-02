import { Injectable, BadRequestException } from '@nestjs/common'
import { Battle, BattleTeam, BattleCategory, BattleLanguage, BattleStatus, BattlePlayTime, BattlePlayTimeName } from '../types/battles.types'
import { BATTLE_PHASE, BATTLE_TYPE, BATTLE_PLAYTIME } from '../const/battles.const'
import type { BattleReferenceData } from '../types/ai.types'
import type { BattleResult } from '../types/battleResult.types'
import type { Battle as PrismaBattle } from 'generated/prisma/client'
import { v7 as uuidv7 } from 'uuid'
import { BattleResponseDto } from '../dto/battleResponse.dto'
import { ClosedBattleResponseDto } from '../dto/closedBattleResponse.dto'

@Injectable()
export class BattleUtil {
  constructor() {}

  generateId(): string {
    return uuidv7()
  }

  generateInviteCode(): string {
    return Date.now().toString()
  }

  getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }

  toBattleEntity(record: PrismaBattle, participantCount: number): Battle {
    const playTime = this.getPlayTime(record.playTime)

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

  buildOpenBattleList(records: PrismaBattle[]): BattleResponseDto[] {
    return records.map(record => {
      const battle = this.toBattleEntity(record, 0)
      return BattleResponseDto.fromEntity(battle)
    })
  }

  buildClosedBattleList(
    records: PrismaBattle[],
    resultBuilder: {
      build: (teamACount: number, teamBCount: number, totalParticipantsCount?: number | null, winningTeam?: string | null) => BattleResult
    },
  ): ClosedBattleResponseDto[] {
    return records.map(record => {
      const teamACount = record.teamACount ?? 0
      const teamBCount = record.teamBCount ?? 0
      const result = resultBuilder.build(teamACount, teamBCount, record.totalParticipantsCount, record.winningTeam)
      const battle = this.toBattleEntity(record, record.totalParticipantsCount ?? teamACount + teamBCount)
      return ClosedBattleResponseDto.of(battle, result)
    })
  }

  shuffleTopics(topics: string[], playTime: BattlePlayTimeName): string[] {
    const playTimeConfig = this.getPlayTime(playTime)
    const rounds = playTimeConfig.rounds
    if (topics.length !== rounds) throw new BadRequestException('대주제의 개수가 라운드 수와 일치하지 않습니다.')

    const shuffled = [...topics]
    if (topics.length === 1) return shuffled

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }

  private getPlayTime(playTimeName: string): BattlePlayTime {
    const playTime = BATTLE_PLAYTIME[playTimeName as BattlePlayTimeName]
    if (!playTime) {
      throw new BadRequestException('올바르지 않은 배틀 진행 시간입니다.')
    }
    return playTime
  }
}
