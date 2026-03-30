import { type Battle as PrismaBattle } from 'generated/prisma/client'
import { ActiveBattleState, BattleDiscussion, BattleTeam } from '../../../domains/models/types/battle.types'
import type { Mvp } from '../../../domains/models/types/battleResult.types'

export interface BattleStatePort {
  //배틀 상태 조회
  loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }>
  //배틀 상태 저장
  saveBattleState(battleId: string, state: ActiveBattleState): void
  //캐시 삭제
  clearBattleStateFromRedis(battleId: string): Promise<void>
  //페이즈 스킵 상태 업데이트
  updateSkipState(battleId: string, skipList: Set<string>): Promise<void>
  //MVP 상태 파싱
  parseMvpsState(value: unknown): Mvp[]
  //사용자 ID로 닉네임 조회
  getNicknameByUserId(state: ActiveBattleState, userId: string): string | null
  //닉네임 중복 체크
  isNicknameDuplicate(battleId: string, nickname: string): Promise<boolean>
  //discussion 메타데이터를 Redis HASH에 저장장.
  saveDiscussionToRedis(battleId: string, discussion: BattleDiscussion, discussionType: 'attack' | 'defense', team: BattleTeam): Promise<void>
  //phase 전환 시 discussion Redis 키를 정리
  resetPhaseDiscussionsInRedis(battleId: string, discussionType: 'attack' | 'defense', teams: BattleTeam[]): Promise<void>
  //atomic vote 처리
  castVoteInRedis(battleId: string, discussionId: string, userId: string): Promise<{ added: boolean; prevDiscussionId: string | null }>
}
