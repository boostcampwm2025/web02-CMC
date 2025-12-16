import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { BattleResultResponseDto, TimelineItemDto, MvpDto } from './dto/battleResult.dto'
import { mockBattleResults } from '../mock/battleResults.mock'

@Injectable()
export class BattlesService {
  async getBattleResult(battleId: string): Promise<BattleResultResponseDto> {
    // 1. 목데이터에서 배틀 조회
    const battle = mockBattleResults[battleId]
    if (!battle) {
      throw new NotFoundException(`배틀을 찾을 수 없습니다: ${battleId}`)
    }

    // 2. 배틀 상태 검증
    if (battle.status !== 'CLOSED') {
      throw new BadRequestException('배틀이 아직 진행 중입니다.')
    }

    // 3. MVP 재계산 (검증용)
    const mvp = this.calculateMVP(battle.timeline)

    return {
      ...battle,
      mvp: mvp || battle.mvp,
    }
  }

  private calculateMVP(timeline: TimelineItemDto[]): MvpDto | null {
    if (timeline.length === 0) return null

    // 사용자별 누적 upvotes 집계
    const userVotes = new Map<string, { nickname: string; team: string; votes: number }>()

    timeline.forEach(item => {
      const current = userVotes.get(item.author.id) || {
        nickname: item.author.nickname,
        team: item.team,
        votes: 0,
      }
      current.votes += item.upvotes
      userVotes.set(item.author.id, current)
    })

    // 최다 득표자 (동점 시 첫 번째)
    const entries = [...userVotes.entries()].sort((a, b) => b[1].votes - a[1].votes)
    if (entries.length === 0) return null

    const [userId, data] = entries[0]

    return {
      userId,
      nickname: data.nickname,
      team: data.team as 'A' | 'B',
      totalVotes: data.votes,
    }
  }
}
