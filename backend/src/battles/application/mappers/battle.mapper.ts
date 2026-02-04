import { BadRequestException } from '@nestjs/common'
import { Battle } from '../../domains/models/types/battle.types'
import { BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_TYPE } from '../../domains/models/const/battles.const'
import type { BattlePlayTimeName, BattleLanguage, BattleCategory, BattleStatus } from '../../domains/models/types/battle.types'
import type { BattleReferenceData } from '../../domains/models/types/ai.types'

//Prisma 레코드를 Battle 도메인 엔티티로 변환
export function toBattleEntity(
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
