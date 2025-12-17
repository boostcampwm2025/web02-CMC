import { v7 as uuidv7 } from 'uuid'
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common'

import { Battle } from '../types/battles.types'
import { TimelineItem, Mvp } from '../types/battleResult.types'
import { mockBattleResults } from '../mock/battleResults.mock'
import { BattleResponseDto } from '../dto/battle-response.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import type { BattleCreateQueryDto } from '../dto/battle-create-query.dto'
import { BATTLE_PHASE, BATTLE_STATUS, BATTLE_TYPE } from '../const/battles.const'
import { BattleJoinRequestDto } from '../dto/battle-join-request.dto'

@Injectable()
export class BattlesService {
  private battles: Battle[] = []

  private generateId(): string {
    return uuidv7()
  }

  create(payload: BattleCreateQueryDto): Battle {
    const now = new Date()

    const battle: Battle = {
      id: this.generateId(),
      authorId: payload.authorId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      aCode: payload.aCode,
      bCode: payload.bCode,
      language: payload.language,
      type: payload.type,
      category: payload.category,
      playTime: payload.playTime,
      password: payload.type === BATTLE_TYPE.PRIVATE ? undefined : payload.password?.trim(),
      status: BATTLE_STATUS.OPEN,
      createdAt: now,
      updatedAt: now,
      participantCount: 1,
      initialState: {
        round: 1,
        phase: BATTLE_PHASE.WAITING_FOR_START,
        timeRemainingSeconds: payload.playTime * 60,
      },
    }

    this.battles.push(battle)

    return battle
  }

  //Todo: 정렬 기준 재설정
  //실시간 배틀 목록 조회
  getOpenBattles(limit: number, offset: number): BattleResponseDto[] {
    const battles = this.battles
      .filter(battle => this.isPublicAndOpen(battle))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) //최신 순
      .slice(offset, offset + limit) // TODO: ORM 적용 시 take/skip

    return BattleResponseDto.of(battles)
  }

  //지난 배틀 조회
  getClosedBattles(limit: number, offset: number): BattleResponseDto[] {
    const battles = this.battles
      .filter(battle => this.isPublicAndClosed(battle))
      .sort((a, b) => this.getExpiredTime(b).getTime() - this.getExpiredTime(a).getTime())
      .slice(offset, offset + limit) //최신 종료 순

    return BattleResponseDto.of(battles)
  }

  getBattleResult(battleId: string): BattleResultResponseDto {
    // 1. 목데이터에서 배틀 조회
    const battle = mockBattleResults[battleId]
    if (!battle) {
      throw new NotFoundException(`배틀을 찾을 수 없습니다: ${battleId}`)
    }

    // 2. 배틀 상태 검증
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('배틀이 아직 진행 중입니다.')
    }

    // 3. MVP 재계산 (검증용)
    const mvp = this.calculateMVP(battle.timeline)

    return BattleResultResponseDto.fromEntity(battle, mvp)
  }

  joinBattle(battleJoinRequestDto: BattleJoinRequestDto) {
    const { battleId, password } = battleJoinRequestDto

    if (!battleId) {
      throw new BadRequestException('Battle ID가 필요합니다.')
    }

    const battle = this.battles.find(battle => battle.id === battleId)

    if (!battle) {
      throw new NotFoundException('존재하지 않는 배틀입니다.')
    }

    if (battle.type === BATTLE_TYPE.PRIVATE && battle.password) {
      const isValid = battle.password === password
      if (!isValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.')
      }
    }

    if (battle.status === BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('이미 종료된 배틀입니다.')
    }

    // TODO: Redis에 해당 배틀에 참여한 클라이언트 저장
    // await this.redisService.addParticipant(battleId, { clientId, team })

    // TODO: Redis에서 현재 배틀 진행 현황을 조회
    const battleState = this.getBattleState(battleId)

    return { battleState }
  }

  private calculateMVP(timeline: TimelineItem[]): Mvp | null {
    if (timeline.length === 0) return null

    // 사용자별 누적 upvotes 집계
    const userVotes = new Map<string, { nickname: string; team: 'A' | 'B'; votes: number }>()

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
      team: data.team,
      totalVotes: data.votes,
    }
  }

  private isPublicAndOpen(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.OPEN
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.CLOSED
  }

  private getExpiredTime(battle: Battle): Date {
    return new Date(battle.createdAt.getTime() + battle.playTime * 60 * 1000)
  }

  private getBattleState(battleId: string) {
    // Redis에서 실시간 데이터 조회
    // const votes = await this.redisService.getVotes(battleId)
    // const attacks = await this.redisService.getAttacks(battleId)
    // const defenses = await this.redisService.getDefenses(battleId)
    // const chats = await this.redisService.getChats(battleId)

    // // DB에서 배틀 기본 정보
    // const battle = await this.prisma.battle.findUnique({
    //   where: { id: battleId },
    // })

    return {
      battleId,
      votes: [{ aTeam: 40, bTeam: 60 }],
      attacks: [
        {
          id: 'attack-1',
          attacker: 'A',
          authorId: '1',
          content: '구현 A의 Set 사용이 더 효율적입니다. O(1) 시간 복잡도를 보장합니다.',
          likes: 15,
        },
        {
          id: 'attack-2',
          attacker: 'B',
          authorId: '2',
          content: '구현 B는 filter를 사용해 가독성이 더 좋습니다.',
          likes: 10,
        },
      ],
      defenses: [
        {
          id: 'defense-1',
          attackId: 'attack-1',
          defenser: 'B',
          authorId: '3',
          content: 'Set은 순서를 보장하지 않습니다. 구현 B의 filter 방식이 더 안전합니다.',
          likes: 12,
        },
        {
          id: 'defense-2',
          attackId: 'attack-2',
          defenser: 'A',
          authorId: '4',
          content: 'filter는 O(n) 복잡도입니다. 대용량 데이터에서 Set이 압도적으로 빠릅니다.',
          likes: 18,
        },
        {
          id: 'defense-3',
          attackId: 'attack-1', // attack-1에 대한 또 다른 반박
          defenser: 'B',
          authorId: '5',
          content: 'Set의 메모리 사용량도 고려해야 합니다. 작은 배열에서는 오히려 비효율적입니다.',
          likes: 8,
        },
      ],
      chats: [
        { authorId: '1', content: 'hi' },
        { authorId: '2', content: 'hi2' },
        { authorId: '3', content: 'hi3' },
      ],
    }
  }
}
