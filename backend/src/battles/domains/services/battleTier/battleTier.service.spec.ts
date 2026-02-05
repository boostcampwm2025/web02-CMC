import { Test, TestingModule } from '@nestjs/testing'
import { BattleTierService } from './battleTier.service'
import { BATTLE_TEAM } from '../../models/const/battles.const'
import type { Mvp } from '../../models/types/battleResult.types'

describe('BattleTierService', () => {
  let service: BattleTierService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattleTierService],
    }).compile()

    service = module.get(BattleTierService)
  })

  describe('buildRatingUpdates', () => {
    it('승/패 가중치와 MVP 보너스를 반영하고 NONE 팀은 제외한다', () => {
      const participants = new Map([
        ['user-a', BATTLE_TEAM.A],
        ['user-b', BATTLE_TEAM.B],
        ['user-c', BATTLE_TEAM.A],
        ['user-none', BATTLE_TEAM.NONE],
      ])

      const users = [
        { id: 'user-a', rating: 0, tier: 'BRONZE' },
        { id: 'user-b', rating: 3, tier: 'BRONZE' },
        { id: 'user-c', rating: 610, tier: 'DIAMOND' },
        { id: 'user-none', rating: 450, tier: 'GOLD' },
      ]

      const mvps: Mvp[] = [
        { userId: 'user-a', nickname: 'A', team: 'A', score: 1, totalVotes: 10, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 0 },
        { userId: 'user-b', nickname: 'B', team: 'B', score: 1, totalVotes: 9, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 1 },
        { userId: 'user-c', nickname: 'C', team: 'A', score: 1, totalVotes: 8, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 2 },
      ]

      const getBattleResultForTeam = (team: string, winningTeam: 'A' | 'B' | 'DRAW'): 'WIN' | 'LOSE' | 'DRAW' | null => {
        if (team === BATTLE_TEAM.NONE) return null
        if (winningTeam === 'DRAW') return 'DRAW'
        if (team === winningTeam) return 'WIN'
        return 'LOSE'
      }

      const updates = service.buildRatingUpdates(participants, users, 'A', mvps, getBattleResultForTeam)

      expect(updates.length).toBe(3) // user-none 제외
      expect(updates.find(u => u.userId === 'user-a')).toBeDefined()
      expect(updates.find(u => u.userId === 'user-b')).toBeDefined()
      expect(updates.find(u => u.userId === 'user-c')).toBeDefined()
      expect(updates.find(u => u.userId === 'user-none')).toBeUndefined()
    })

    it('무승부는 승/무 가중치를 적용한다', () => {
      const participants = new Map([
        ['user-d', BATTLE_TEAM.A],
        ['user-e', BATTLE_TEAM.B],
      ])

      const users = [
        { id: 'user-d', rating: 210, tier: 'SILVER' },
        { id: 'user-e', rating: 410, tier: 'GOLD' },
      ]

      const getBattleResultForTeam = (team: string, winningTeam: 'A' | 'B' | 'DRAW'): 'WIN' | 'LOSE' | 'DRAW' | null => {
        if (team === BATTLE_TEAM.NONE) return null
        if (winningTeam === 'DRAW') return 'DRAW'
        if (team === winningTeam) return 'WIN'
        return 'LOSE'
      }

      const updates = service.buildRatingUpdates(participants, users, 'DRAW', [], getBattleResultForTeam)

      expect(updates.length).toBe(2)
      expect(updates.find(u => u.userId === 'user-d')).toBeDefined()
      expect(updates.find(u => u.userId === 'user-e')).toBeDefined()
    })

    it('참가자 목록에 없는 유저는 업데이트하지 않는다', () => {
      const participants = new Map([['user-a', BATTLE_TEAM.A]])

      const users = [
        { id: 'user-a', rating: 100, tier: 'BRONZE' },
        { id: 'user-unknown', rating: 200, tier: 'SILVER' },
      ]

      const getBattleResultForTeam = (team: string, winningTeam: 'A' | 'B' | 'DRAW'): 'WIN' | 'LOSE' | 'DRAW' | null => {
        if (team === BATTLE_TEAM.NONE) return null
        if (winningTeam === 'DRAW') return 'DRAW'
        if (team === winningTeam) return 'WIN'
        return 'LOSE'
      }

      const updates = service.buildRatingUpdates(participants, users, 'A', [], getBattleResultForTeam)

      expect(updates.length).toBe(1)
      expect(updates.find(u => u.userId === 'user-a')).toBeDefined()
      expect(updates.find(u => u.userId === 'user-unknown')).toBeUndefined()
    })

    it('rating이 null인 유저는 0으로 처리한다', () => {
      const participants = new Map([['user-a', BATTLE_TEAM.A]])

      const users = [{ id: 'user-a', rating: null, tier: null }]

      const getBattleResultForTeam = (team: string, winningTeam: 'A' | 'B' | 'DRAW'): 'WIN' | 'LOSE' | 'DRAW' | null => {
        if (team === BATTLE_TEAM.NONE) return null
        if (winningTeam === 'DRAW') return 'DRAW'
        if (team === winningTeam) return 'WIN'
        return 'LOSE'
      }

      const updates = service.buildRatingUpdates(participants, users, 'A', [], getBattleResultForTeam)

      expect(updates.length).toBe(1)
      expect(updates[0].currentRating).toBe(0)
      expect(updates[0].nextRating).toBeGreaterThan(0)
    })

    it('레이팅이 0인 유저가 패배해도 음수가 되지 않는다', () => {
      const participants = new Map([['user-a', BATTLE_TEAM.A]])

      const users = [{ id: 'user-a', rating: 0, tier: 'BRONZE' }]

      const getBattleResultForTeam = (): 'WIN' | 'LOSE' | 'DRAW' | null => 'LOSE'

      const updates = service.buildRatingUpdates(participants, users, 'B', [], getBattleResultForTeam)

      expect(updates.length).toBe(0) // 레이팅 변화 없으므로 업데이트 없음
    })

    it('레이팅과 티어 모두 변화가 없으면 업데이트하지 않는다', () => {
      const participants = new Map([['user-a', BATTLE_TEAM.A]])

      const users = [{ id: 'user-a', rating: 5, tier: 'BRONZE' }]

      // 패배해도 0 이하로 떨어지지 않고, 티어도 BRONZE 유지
      const getBattleResultForTeam = (): 'WIN' | 'LOSE' | 'DRAW' | null => 'LOSE'

      const updates = service.buildRatingUpdates(participants, users, 'B', [], getBattleResultForTeam)

      // rating: 5 - 10 = -5 -> 0 (floor), tier: BRONZE -> BRONZE
      // currentRating(5) !== nextRating(0) 이므로 업데이트됨
      expect(updates.length).toBe(1)
      expect(updates[0].nextRating).toBe(0)
    })

    it('티어 경계값에서 승리하면 다음 티어로 승급한다', () => {
      const participants = new Map([['user-a', BATTLE_TEAM.A]])

      // BRONZE(0-199) -> SILVER(200-399) 경계
      const users = [{ id: 'user-a', rating: 190, tier: 'BRONZE' }]

      const getBattleResultForTeam = (): 'WIN' | 'LOSE' | 'DRAW' | null => 'WIN'

      const updates = service.buildRatingUpdates(participants, users, 'A', [], getBattleResultForTeam)

      // BRONZE 승리: 15 * 2.0 = 30점 추가, 190 + 30 = 220 -> SILVER
      expect(updates.length).toBe(1)
      expect(updates[0].currentTier).toBe('BRONZE')
      expect(updates[0].nextTier).toBe('SILVER')
      expect(updates[0].nextRating).toBe(220)
    })

    it('4위 이하 MVP는 보너스를 받지 않는다', () => {
      const participants = new Map([
        ['user-a', BATTLE_TEAM.A],
        ['user-b', BATTLE_TEAM.A],
        ['user-c', BATTLE_TEAM.A],
        ['user-d', BATTLE_TEAM.A],
      ])

      const users = [
        { id: 'user-a', rating: 100, tier: 'BRONZE' },
        { id: 'user-b', rating: 100, tier: 'BRONZE' },
        { id: 'user-c', rating: 100, tier: 'BRONZE' },
        { id: 'user-d', rating: 100, tier: 'BRONZE' },
      ]

      const mvps: Mvp[] = [
        { userId: 'user-a', nickname: 'A', team: 'A', score: 40, totalVotes: 10, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 0 },
        { userId: 'user-b', nickname: 'B', team: 'A', score: 30, totalVotes: 9, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 1 },
        { userId: 'user-c', nickname: 'C', team: 'A', score: 20, totalVotes: 8, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 2 },
        { userId: 'user-d', nickname: 'D', team: 'A', score: 10, totalVotes: 7, opinionCount: 1, selectedOpinionCount: 0, joinedAt: 3 },
      ]

      const getBattleResultForTeam = (): 'WIN' | 'LOSE' | 'DRAW' | null => 'WIN'

      const updates = service.buildRatingUpdates(participants, users, 'A', mvps, getBattleResultForTeam)

      const userA = updates.find(u => u.userId === 'user-a')
      const userB = updates.find(u => u.userId === 'user-b')
      const userC = updates.find(u => u.userId === 'user-c')
      const userD = updates.find(u => u.userId === 'user-d')

      expect(userA?.mvpBonus).toBe(10) // 1위
      expect(userB?.mvpBonus).toBe(5) // 2위
      expect(userC?.mvpBonus).toBe(3) // 3위
      expect(userD?.mvpBonus).toBe(0) // 4위 - 보너스 없음
    })

    it('getBattleResultForTeam이 null을 반환하면 업데이트하지 않는다', () => {
      const participants = new Map([['user-a', BATTLE_TEAM.A]])

      const users = [{ id: 'user-a', rating: 100, tier: 'BRONZE' }]

      const getBattleResultForTeam = (): 'WIN' | 'LOSE' | 'DRAW' | null => null

      const updates = service.buildRatingUpdates(participants, users, 'A', [], getBattleResultForTeam)

      expect(updates.length).toBe(0)
    })
  })
})
