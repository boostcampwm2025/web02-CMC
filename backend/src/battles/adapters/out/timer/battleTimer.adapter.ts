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

    const now = Date.now()
    const remaining = Math.ceil((state.expiredAt - now) / 1000)

    console.log(`📝 [타이머 등록] battleId=${battleId}`)
    console.log(`   - 현재 시간: ${now} (${new Date(now).toLocaleString('ko-KR')})`)
    console.log(`   - 만료 시간: ${state.expiredAt} (${new Date(state.expiredAt).toLocaleString('ko-KR')})`)
    console.log(`   - 남은 시간: ${remaining}초`)

    // Redis Sorted Set에 저장 (score = expiredAt, member = battleId)
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
    const expiredBattles = await this.redisRepository.zrangebyscore(this.TIMERS_KEY, '-inf', now)

    // 디버그: 실제 score 값 확인
    if (expiredBattles.length > 0) {
      console.log(`🔍 [만료 조회] 현재=${now}`)
      for (const battleId of expiredBattles) {
        const score = await this.redisRepository.zscore(this.TIMERS_KEY, battleId)
        const diff = score ? Number(score) - now : 0
        console.log(`   - ${battleId}: score=${score}, 차이=${Math.ceil(diff / 1000)}초`)
      }
    }

    return expiredBattles
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
}
