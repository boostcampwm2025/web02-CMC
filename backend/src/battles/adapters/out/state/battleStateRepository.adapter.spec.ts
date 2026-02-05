/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common'
import { BattleStateRepositoryAdapter } from './battleStateRepository.adapter'
import type { PrismaService } from '../../../../prisma/prisma.service'
import { BATTLE_TEAM } from '../../../domains/models/const/battles.const'

describe('BattleStateRepositoryAdapter', () => {
  let adapter: BattleStateRepositoryAdapter
  let prisma: jest.Mocked<PrismaService>

  const createMockBattle = (overrides = {}) => ({
    id: 'battle-1',
    playTime: 'FIFTEEN_MIN',
    currentRound: 1,
    currentPhase: 'PENDING',
    phaseCount: 1,
    startedAt: null,
    expiredAt: null,
    topics: ['topic1'],
    participantsState: [],
    teamVotesState: [],
    userInfoState: [],
    attacksState: { teamA: [], teamB: [], all: [] },
    defensesState: { teamA: [], teamB: [], all: [] },
    opinionHistoryState: [],
    chatsAllState: [],
    chatsTeamAState: [],
    chatsTeamBState: [],
    skipState: [],
    ...overrides,
  })

  beforeEach(() => {
    prisma = {
      battle: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>
    adapter = new BattleStateRepositoryAdapter(prisma)
  })

  describe('loadBattleState', () => {
    it('배틀 상태를 로드한다', async () => {
      const mockBattle = createMockBattle()
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.loadBattleState('battle-1')

      expect(result.battle).toEqual(mockBattle)
      expect(result.state.battleId).toBe('battle-1')
      expect(result.state.round).toBe(1)
      expect(result.state.phase).toBe('PENDING')
    })

    it('배틀이 없으면 NotFoundException을 던진다', async () => {
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(adapter.loadBattleState('nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('올바르지 않은 playTime이면 NotFoundException을 던진다', async () => {
      const mockBattle = createMockBattle({ playTime: 'INVALID' })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      await expect(adapter.loadBattleState('battle-1')).rejects.toThrow(NotFoundException)
    })

    it('participants를 파싱한다', async () => {
      const mockBattle = createMockBattle({
        participantsState: [
          { userId: 'user-1', team: 'A' },
          { userId: 'user-2', team: 'B' },
        ],
      })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.loadBattleState('battle-1')

      expect(result.state.participants.get('user-1')).toBe('A')
      expect(result.state.participants.get('user-2')).toBe('B')
      expect(result.state.teamA.users).toContain('user-1')
      expect(result.state.teamB.users).toContain('user-2')
    })

    it('userInfoMap을 파싱한다', async () => {
      const mockBattle = createMockBattle({
        userInfoState: [{ userId: 'user-1', nickname: '테스터' }],
      })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.loadBattleState('battle-1')

      expect(result.state.userInfoMap.get('user-1')).toBe('테스터')
    })

    it('채팅 상태를 파싱한다', async () => {
      const mockBattle = createMockBattle({
        chatsAllState: [{ message: 'hello', createdAt: '2024-01-01T00:00:00.000Z' }],
      })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.loadBattleState('battle-1')

      expect(result.state.all.chats).toHaveLength(1)
      expect(result.state.all.chats[0].message).toBe('hello')
    })

    it('skipState를 파싱한다', async () => {
      const mockBattle = createMockBattle({
        skipState: ['user-1', 'user-2'],
      })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.loadBattleState('battle-1')

      expect(result.state.skipState.has('user-1')).toBe(true)
      expect(result.state.skipState.has('user-2')).toBe(true)
    })

    it('startedAt과 expiredAt이 있으면 타임스탬프로 변환한다', async () => {
      const startedAt = new Date('2024-01-01T00:00:00.000Z')
      const expiredAt = new Date('2024-01-01T00:15:00.000Z')
      const mockBattle = createMockBattle({ startedAt, expiredAt })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.loadBattleState('battle-1')

      expect(result.state.startedAt).toBe(startedAt.getTime())
      expect(result.state.expiredAt).toBe(expiredAt.getTime())
    })
  })

  describe('saveBattleState', () => {
    it('배틀 상태를 저장한다', async () => {
      ;(prisma.battle.update as jest.Mock).mockResolvedValue({})

      const state = {
        battleId: 'battle-1',
        round: 2,
        phase: 'ATTACK' as const,
        phaseCount: 1,
        startedAt: Date.now(),
        expiredAt: Date.now() + 60000,
        participants: new Map([['user-1', BATTLE_TEAM.A]]),
        teamVotes: new Map(),
        userInfoMap: new Map([['user-1', '테스터']]),
        opinionHistory: [],
        skipState: new Set<string>(),
        all: { roomId: 'battle:battle-1', chats: [], attacks: [], defenses: [] },
        teamA: { roomId: 'battle:battle-1:A', users: ['user-1'], chats: [], attacks: [], defenses: [] },
        teamB: { roomId: 'battle:battle-1:B', users: [], chats: [], attacks: [], defenses: [] },
        topics: ['topic1'],
        totalRounds: 1,
      }

      await adapter.saveBattleState('battle-1', state)

      expect(prisma.battle.update).toHaveBeenCalledWith({
        where: { id: 'battle-1' },
        data: expect.objectContaining({
          currentRound: 2,
          currentPhase: 'ATTACK',
        }),
      })
    })
  })

  describe('updateSkipState', () => {
    it('스킵 상태를 업데이트한다', async () => {
      ;(prisma.battle.update as jest.Mock).mockResolvedValue({})

      await adapter.updateSkipState('battle-1', new Set(['user-1', 'user-2']))

      expect(prisma.battle.update).toHaveBeenCalledWith({
        where: { id: 'battle-1' },
        data: expect.objectContaining({
          skipState: expect.arrayContaining(['user-1', 'user-2']),
        }),
      })
    })
  })

  describe('parseMvpsState', () => {
    it('MVP 상태를 파싱한다', () => {
      const mvpsState = [
        {
          userId: 'user-1',
          nickname: '테스터',
          team: 'A',
          score: 100,
          totalVotes: 10,
          opinionCount: 5,
          selectedOpinionCount: 2,
          joinedAt: 1234567890,
        },
      ]

      const result = adapter.parseMvpsState(mvpsState)

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe('user-1')
      expect(result[0].nickname).toBe('테스터')
      expect(result[0].team).toBe('A')
    })

    it('빈 배열이면 빈 배열을 반환한다', () => {
      const result = adapter.parseMvpsState([])
      expect(result).toEqual([])
    })

    it('배열이 아니면 빈 배열을 반환한다', () => {
      const result = adapter.parseMvpsState(null)
      expect(result).toEqual([])
    })

    it('닉네임이 없는 항목은 필터링한다', () => {
      const mvpsState = [{ userId: 'user-1', team: 'A', score: 100 }]

      const result = adapter.parseMvpsState(mvpsState)

      expect(result).toHaveLength(0)
    })

    it('team이 A나 B가 아니면 NONE으로 처리한다', () => {
      const mvpsState = [{ userId: 'user-1', nickname: '테스터', team: 'INVALID', score: 100 }]

      const result = adapter.parseMvpsState(mvpsState)

      expect(result[0].team).toBe('NONE')
    })
  })

  describe('getNicknameByUserId', () => {
    it('userId로 닉네임을 찾는다', () => {
      const state = {
        userInfoMap: new Map([['user-1', '테스터']]),
      } as Parameters<typeof adapter.getNicknameByUserId>[0]

      const result = adapter.getNicknameByUserId(state, 'user-1')

      expect(result).toBe('테스터')
    })

    it('없으면 null을 반환한다', () => {
      const state = {
        userInfoMap: new Map(),
      } as Parameters<typeof adapter.getNicknameByUserId>[0]

      const result = adapter.getNicknameByUserId(state, 'nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('isNicknameDuplicate', () => {
    it('닉네임이 중복되면 true를 반환한다', async () => {
      const mockBattle = createMockBattle({
        userInfoState: [{ userId: 'user-1', nickname: '테스터' }],
      })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.isNicknameDuplicate('battle-1', '테스터')

      expect(result).toBe(true)
    })

    it('닉네임이 중복되지 않으면 false를 반환한다', async () => {
      const mockBattle = createMockBattle({
        userInfoState: [{ userId: 'user-1', nickname: '테스터' }],
      })
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.isNicknameDuplicate('battle-1', '새닉네임')

      expect(result).toBe(false)
    })
  })
})
