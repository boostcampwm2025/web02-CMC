import { Injectable } from '@nestjs/common'
import { ActiveBattleState } from '../../../domains/models/types/battle.types'
import { BattleTimerPort } from '../../../application/ports/out/battleTimer.port'
import { RedisRepository } from '../../../../redis/redis.repository'

@Injectable()
export class BattleTimerAdapter implements BattleTimerPort {
  private readonly TIMERS_KEY = 'battle:timers'

  constructor(private readonly redisRepository: RedisRepository) {}

  //배틀 타이머 스케줄러
  schedule(battleId: string, state: ActiveBattleState): void {
    if (!state.expiredAt) return

    // Redis Sorted Set에 저장
    void this.redisRepository.zadd(this.TIMERS_KEY, state.expiredAt, battleId)
  }

  //배틀 타이머 취소
  cancel(battleId: string): void {
    void this.redisRepository.zrem(this.TIMERS_KEY, battleId)
  }

  //만료된 배틀 ID 목록 조회
  async getExpiredBattles(): Promise<string[]> {
    const now = Date.now()

    // 현재 시간보다 작은 score를 가진 모든 member 조회
    return await this.redisRepository.zrangebyscore(this.TIMERS_KEY, '-inf', now)
  }

  //만료된 배틀 제거
  async removeExpiredBattles(battleIds: string[]): Promise<void> {
    if (battleIds.length === 0) return

    await this.redisRepository.zrem(this.TIMERS_KEY, ...battleIds)
  }

  //모든 배틀 타이머 취소 (테스트용)
  clear(): void {
    void this.redisRepository.del(this.TIMERS_KEY)
  }

  //특정 배틀의 ZSET 등록 score 조회
  async getScheduledScore(battleId: string): Promise<number | null> {
    const score = await this.redisRepository.zscore(this.TIMERS_KEY, battleId)
    return score === null ? null : Number(score)
  }
}
