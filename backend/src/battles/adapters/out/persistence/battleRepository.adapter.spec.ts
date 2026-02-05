/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common'
import { BattleRepositoryAdapter } from './battleRepository.adapter'
import type { PrismaService } from '../../../../prisma/prisma.service'

describe('BattleRepositoryAdapter', () => {
  let adapter: BattleRepositoryAdapter
  let prisma: jest.Mocked<PrismaService>

  beforeEach(() => {
    prisma = {
      battle: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      battleParticipant: {
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>
    adapter = new BattleRepositoryAdapter(prisma)
  })

  describe('findUnique', () => {
    it('배틀을 찾아 반환한다', async () => {
      const mockBattle = { id: 'battle-1', title: '테스트 배틀' }
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.findUnique('battle-1')

      expect(result).toEqual(mockBattle)
      expect(prisma.battle.findUnique).toHaveBeenCalledWith({ where: { id: 'battle-1' } })
    })

    it('배틀이 없으면 NotFoundException을 던진다', async () => {
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(adapter.findUnique('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findBattleList', () => {
    it('배틀 목록을 조회한다', async () => {
      const mockBattles = [{ id: 'battle-1' }, { id: 'battle-2' }]
      ;(prisma.battle.findMany as jest.Mock).mockResolvedValue(mockBattles)

      const result = await adapter.findBattleList({ limit: 10, offset: 0 })

      expect(result).toEqual(mockBattles)
    })

    it('공개 배틀만 조회한다', async () => {
      ;(prisma.battle.findMany as jest.Mock).mockResolvedValue([])

      await adapter.findBattleList({ onlyPublic: true, limit: 10, offset: 0 })

      expect(prisma.battle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPrivate: false },
        }),
      )
    })

    it('상태로 필터링한다 (문자열)', async () => {
      ;(prisma.battle.findMany as jest.Mock).mockResolvedValue([])

      await adapter.findBattleList({ status: 'OPEN', limit: 10, offset: 0 })

      expect(prisma.battle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'OPEN' },
        }),
      )
    })

    it('상태로 필터링한다 (배열)', async () => {
      ;(prisma.battle.findMany as jest.Mock).mockResolvedValue([])

      await adapter.findBattleList({ status: { in: ['OPEN', 'CLOSED'] }, limit: 10, offset: 0 })

      expect(prisma.battle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: { in: ['OPEN', 'CLOSED'] } },
        }),
      )
    })

    it('정렬 옵션을 적용한다', async () => {
      ;(prisma.battle.findMany as jest.Mock).mockResolvedValue([])

      await adapter.findBattleList({ limit: 10, offset: 0, orderBy: { finishedAt: 'desc' } })

      expect(prisma.battle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { finishedAt: 'desc' },
        }),
      )
    })
  })

  describe('countBattleList', () => {
    it('배틀 수를 반환한다', async () => {
      ;(prisma.battle.count as jest.Mock).mockResolvedValue(5)

      const result = await adapter.countBattleList({})

      expect(result).toBe(5)
    })

    it('상태 필터로 카운트한다', async () => {
      ;(prisma.battle.count as jest.Mock).mockResolvedValue(3)

      await adapter.countBattleList({ status: 'OPEN' })

      expect(prisma.battle.count).toHaveBeenCalledWith({ where: { status: 'OPEN' } })
    })

    it('상태 배열 필터로 카운트한다', async () => {
      ;(prisma.battle.count as jest.Mock).mockResolvedValue(3)

      await adapter.countBattleList({ status: { in: ['OPEN', 'CLOSED'] } })

      expect(prisma.battle.count).toHaveBeenCalledWith({ where: { status: { in: ['OPEN', 'CLOSED'] } } })
    })
  })

  describe('findUniqueByInviteCode', () => {
    it('초대 코드로 배틀을 찾는다', async () => {
      const mockBattle = { id: 'battle-1', inviteCode: 'ABC123' }
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.findUniqueByInviteCode('ABC123')

      expect(result).toEqual(mockBattle)
      expect(prisma.battle.findUnique).toHaveBeenCalledWith({ where: { inviteCode: 'ABC123' } })
    })

    it('없으면 null을 반환한다', async () => {
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await adapter.findUniqueByInviteCode('INVALID')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('배틀을 생성한다', async () => {
      const createData = {
        id: 'battle-1',
        userId: 'user-1',
        title: '테스트',
        description: '설명',
        codeA: 'code A',
        codeB: 'code B',
        language: 'javascript',
        category: 'ALGORITHM',
        playTime: 'FIFTEEN_MIN',
        topics: ['topic1'],
        inviteCode: null,
        isPrivate: false,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        currentRound: 1,
        currentPhase: 'PENDING',
        phaseCount: 1,
        startedAt: null,
        expiredAt: null,
        participantsState: [],
        teamVotesState: [],
        userInfoState: [],
        attacksState: {},
        defensesState: {},
        opinionHistoryState: [],
        chatsAllState: [],
        chatsTeamAState: [],
        chatsTeamBState: [],
      }
      const mockBattle = { ...createData }
      ;(prisma.battle.create as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.create(createData)

      expect(result).toEqual(mockBattle)
      expect(prisma.battle.create).toHaveBeenCalledWith({ data: createData })
    })
  })

  describe('update', () => {
    it('배틀을 업데이트한다', async () => {
      const mockBattle = { id: 'battle-1', status: 'OPEN' }
      ;(prisma.battle.update as jest.Mock).mockResolvedValue(mockBattle)

      const result = await adapter.update('battle-1', { status: 'OPEN' })

      expect(result).toEqual(mockBattle)
      expect(prisma.battle.update).toHaveBeenCalledWith({
        where: { id: 'battle-1' },
        data: { status: 'OPEN' },
      })
    })
  })

  describe('findUniqueUser', () => {
    it('사용자를 찾아 반환한다', async () => {
      const mockUser = { id: 'user-1', rating: 1500, tier: 'SILVER' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await adapter.findUniqueUser('user-1', { id: true, rating: true, tier: true })

      expect(result).toEqual(mockUser)
    })

    it('select 옵션 없이 조회한다', async () => {
      const mockUser = { id: 'user-1' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await adapter.findUniqueUser('user-1')

      expect(result).toEqual(mockUser)
    })
  })

  describe('findManyUsers', () => {
    it('여러 사용자를 조회한다', async () => {
      const mockUsers = [
        { id: 'user-1', rating: 1500, tier: 'SILVER' },
        { id: 'user-2', rating: 1600, tier: 'GOLD' },
      ]
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const result = await adapter.findManyUsers({
        where: { id: { in: ['user-1', 'user-2'] } },
        select: { id: true, rating: true, tier: true },
      })

      expect(result).toEqual(mockUsers)
    })
  })

  describe('updateUser', () => {
    it('사용자 정보를 업데이트한다', async () => {
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      await adapter.updateUser('user-1', { rating: 1600, tier: 'GOLD' })

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { rating: 1600, tier: 'GOLD' },
      })
    })
  })

  describe('upsertBattleParticipant', () => {
    it('참가자를 upsert한다', async () => {
      ;(prisma.battleParticipant.upsert as jest.Mock).mockResolvedValue({})

      await adapter.upsertBattleParticipant({
        userId: 'user-1',
        battleId: 'battle-1',
        team: 'A',
        isMvp: false,
      })

      expect(prisma.battleParticipant.upsert).toHaveBeenCalledWith({
        where: { userId_battleId: { userId: 'user-1', battleId: 'battle-1' } },
        create: { userId: 'user-1', battleId: 'battle-1', team: 'A', isMvp: false },
        update: { team: 'A', isMvp: false },
      })
    })
  })

  describe('updateManyBattleParticipants', () => {
    it('여러 참가자를 업데이트한다', async () => {
      ;(prisma.battleParticipant.updateMany as jest.Mock).mockResolvedValue({})

      await adapter.updateManyBattleParticipants({
        where: { battleId: 'battle-1', userId: { in: ['user-1', 'user-2'] } },
        data: { isMvp: true },
      })

      expect(prisma.battleParticipant.updateMany).toHaveBeenCalledWith({
        where: { battleId: 'battle-1', userId: { in: ['user-1', 'user-2'] } },
        data: { isMvp: true },
      })
    })

    it('userId 필터 없이 업데이트한다', async () => {
      ;(prisma.battleParticipant.updateMany as jest.Mock).mockResolvedValue({})

      await adapter.updateManyBattleParticipants({
        where: { battleId: 'battle-1' },
        data: { isMvp: false },
      })

      expect(prisma.battleParticipant.updateMany).toHaveBeenCalledWith({
        where: { battleId: 'battle-1' },
        data: { isMvp: false },
      })
    })
  })

  describe('transaction', () => {
    it('트랜잭션을 실행한다', async () => {
      const mockResult = { success: true }
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const txMock = {
          battle: { findUnique: jest.fn() },
        }
        return fn(txMock)
      })

      const result = await adapter.transaction(() => Promise.resolve(mockResult))

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })
})
