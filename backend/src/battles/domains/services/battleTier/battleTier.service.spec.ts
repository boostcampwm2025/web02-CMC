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
  })
})
