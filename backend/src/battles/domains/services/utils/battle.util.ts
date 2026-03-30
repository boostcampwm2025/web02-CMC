import { BATTLE_PLAYTIME } from '../../models/const/battles.const'
import type { BattlePlayTimeName } from '../../models/types/battle.types'
import { BadRequestException } from '@nestjs/common'

/**
 * 배틀 룸 ID를 생성한다
 * @param battleId 배틀 ID
 * @param team 팀 ('A' 또는 'B'). 없으면 전체 룸
 * @returns 룸 ID 문자열
 */
export function getBattleRoomId(battleId: string, team?: string): string {
  return team ? `battle:${battleId}:room:${team}` : `battle:${battleId}:room:all`
}

/**
 * 주제 배열을 셔플한다
 * @param topics 주제 배열
 * @param playTime 배틀 진행 시간 (라운드 수 결정)
 * @returns 셔플된 주제 배열
 */
export function shuffleTopics(topics: string[], playTime: string): string[] {
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
