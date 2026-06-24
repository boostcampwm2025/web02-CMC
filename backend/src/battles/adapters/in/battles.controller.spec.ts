import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import type { Response } from 'express'
import type { BattleLanguage, BattleCategory } from '../../domains/models/types/battle.types'
import { BattlesController } from './battles.controller'
import { BattleCreationUseCase } from '../../application/usecases/battleCreation.usecase'
import { BattleQueryUseCase } from '../../application/usecases/battleQuery.usecase'
import { BattleListRequestQueryDto } from '../../dto/battleListRequestQuery.dto'
import { BattleResultResponseDto } from '../../dto/battleResult.dto'
import { BATTLE_TYPE, BATTLE_PLAYTIME } from '../../domains/models/const/battles.const'
import { InviteAccessGuard } from '../../guards/inviteAccess.guard'

describe('BattlesController', () => {
  let controller: BattlesController
  let creationUseCase: jest.Mocked<BattleCreationUseCase>
  let queryUseCase: jest.Mocked<BattleQueryUseCase>
  const aiRateLimit = {
    limitPerMinute: 5,
    remainingMinute: 4,
    limitPerDay: 20,
    remainingDay: 19,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [
        {
          provide: BattleCreationUseCase,
          useValue: { create: jest.fn() },
        },
        {
          provide: BattleQueryUseCase,
          useValue: {
            getOpenBattles: jest.fn(),
            getClosedBattles: jest.fn(),
            getBattleByInviteCode: jest.fn(),
            getJoinBattleInfo: jest.fn(),
            getBattleResult: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
        {
          provide: InviteAccessGuard,
          useValue: { canActivate: jest.fn().mockResolvedValue(true) },
        },
      ],
    })
      .overrideGuard(InviteAccessGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile()

    controller = module.get(BattlesController)
    creationUseCase = module.get(BattleCreationUseCase)
    queryUseCase = module.get(BattleQueryUseCase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getOpenBattles', () => {
    it('query.limit/offset을 getOpenBattlesUseCase로 전달하고 결과를 반환한다', async () => {
      const query: BattleListRequestQueryDto = { limit: 10, offset: 0 }

      const mockResult = {
        battles: [],
        meta: { limit: 10, offset: 0, total: 0 },
      }

      const getOpenBattlesSpy = jest.spyOn(queryUseCase, 'getOpenBattles')
      getOpenBattlesSpy.mockResolvedValue(mockResult)

      const result = await controller.getOpenBattles(query)

      expect(getOpenBattlesSpy).toHaveBeenCalledWith(10, 0)
      expect(result).toBe(mockResult)
    })
  })

  describe('getClosedBattles', () => {
    it('query.limit/offset을 getClosedBattlesUseCase로 전달하고 결과를 반환한다', async () => {
      const query: BattleListRequestQueryDto = { limit: 5, offset: 20 }

      const mockResult = {
        battles: [],
        meta: { limit: 5, offset: 20, total: 0 },
      }

      const getClosedBattlesSpy = jest.spyOn(queryUseCase, 'getClosedBattles')
      getClosedBattlesSpy.mockResolvedValue(mockResult)

      const result = await controller.getClosedBattles(query)

      expect(getClosedBattlesSpy).toHaveBeenCalledWith(5, 20)
      expect(result).toBe(mockResult)
    })
  })

  describe('createBattle', () => {
    it('비공개 배틀 생성 시 battleId와 inviteCode를 반환한다', async () => {
      const mockBattle = {
        id: 'battle-1',
        authorId: 'user-1',
        title: 'Test Battle',
        description: 'Test Description',
        aCode: 'codeA',
        bCode: 'codeB',
        language: 'TS' as BattleLanguage,
        type: BATTLE_TYPE.PRIVATE,
        category: 'ALGORITHM' as BattleCategory,
        playTime: BATTLE_PLAYTIME.FIFTEEN_MIN,
        topics: ['효율성'],
        inviteCode: 'test-invite-code-1234',
        status: 'PENDING' as const,
        participantCount: 0,
        initialState: {
          round: 1,
          phase: 'OPINION_SHARE' as const,
          phaseCount: 1,
          timeRemainingSeconds: 900,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const jsonMock = jest.fn()
      const cookieMock = jest.fn()
      const setHeaderMock = jest.fn()
      const res = { json: jsonMock, cookie: cookieMock, setHeader: setHeaderMock } as unknown as Response

      const createSpy = jest.spyOn(creationUseCase, 'create')
      createSpy.mockResolvedValue({ battle: mockBattle, aiRateLimit })

      await controller.createBattle(
        {
          authorId: 'user-1',
          title: 'Test Battle',
          description: 'Test Description',
          aCode: 'codeA',
          bCode: 'codeB',
          language: 'TS' as BattleLanguage,
          type: 'PRIVATE',
          category: 'ALGORITHM' as BattleCategory,
          playTime: 'FIFTEEN_MIN',
          topics: ['효율성'],
        },
        res,
      )

      expect(createSpy).toHaveBeenCalled()
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit-Minute', 5)
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining-Minute', 4)
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit-Day', 20)
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining-Day', 19)
      expect(cookieMock).toHaveBeenCalledWith('inviteAccess_battle-1', 'true', expect.any(Object))
      expect(jsonMock).toHaveBeenCalledWith({
        battleId: 'battle-1',
        inviteCode: 'test-invite-code-1234',
      })
    })

    it('공개 배틀 생성 시 battleId와 inviteCode(null)를 반환한다', async () => {
      const mockBattle = {
        id: 'battle-1',
        authorId: 'user-1',
        title: 'Test Battle',
        description: 'Test Description',
        aCode: 'codeA',
        bCode: 'codeB',
        language: 'TS' as BattleLanguage,
        type: BATTLE_TYPE.PUBLIC,
        category: 'ALGORITHM' as BattleCategory,
        playTime: BATTLE_PLAYTIME.FIFTEEN_MIN,
        topics: ['효율성'],
        inviteCode: undefined,
        status: 'PENDING' as const,
        participantCount: 0,
        initialState: {
          round: 1,
          phase: 'OPINION_SHARE' as const,
          phaseCount: 1,
          timeRemainingSeconds: 900,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const jsonMock = jest.fn()
      const cookieMock = jest.fn()
      const setHeaderMock = jest.fn()
      const res = { json: jsonMock, cookie: cookieMock, setHeader: setHeaderMock } as unknown as Response

      const createSpy = jest.spyOn(creationUseCase, 'create')
      createSpy.mockResolvedValue({ battle: mockBattle, aiRateLimit })

      await controller.createBattle(
        {
          authorId: 'user-1',
          title: 'Test Battle',
          description: 'Test Description',
          aCode: 'codeA',
          bCode: 'codeB',
          language: 'TS' as BattleLanguage,
          type: 'PUBLIC',
          category: 'ALGORITHM' as BattleCategory,
          playTime: 'FIFTEEN_MIN',
          topics: ['효율성'],
        },
        res,
      )

      expect(createSpy).toHaveBeenCalled()
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit-Minute', 5)
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining-Minute', 4)
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit-Day', 20)
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining-Day', 19)
      expect(cookieMock).not.toHaveBeenCalled()
      expect(jsonMock).toHaveBeenCalledWith({
        battleId: 'battle-1',
        inviteCode: null,
      })
    })
  })

  describe('getBattleByInviteCode', () => {
    it('inviteCode로 배틀을 찾고 리다이렉트한다', async () => {
      const mockResult = { battleId: 'battle-1' }
      const getBattleByInviteCodeSpy = jest.spyOn(queryUseCase, 'getBattleByInviteCode')
      getBattleByInviteCodeSpy.mockResolvedValue(mockResult)

      const redirectMock = jest.fn()
      const cookieMock = jest.fn()
      const res = { redirect: redirectMock, cookie: cookieMock } as unknown as Response

      await controller.getBattleByInviteCode('test-invite-code', res)

      expect(getBattleByInviteCodeSpy).toHaveBeenCalledWith('test-invite-code')
      expect(cookieMock).toHaveBeenCalledWith('inviteAccess_battle-1', 'true', expect.any(Object))
      expect(redirectMock).toHaveBeenCalledWith(303, 'http://localhost:5173/battle/battle-1/team-select')
    })

    it('존재하지 않는 inviteCode면 NotFoundException을 던진다', async () => {
      queryUseCase.getBattleByInviteCode.mockRejectedValue(new NotFoundException())

      const res = {
        redirect: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response

      await expect(controller.getBattleByInviteCode('invalid-code', res)).rejects.toThrow(NotFoundException)
    })
  })

  describe('joinBattleInfo', () => {
    it('배틀 정보를 반환한다', async () => {
      const mockResult = {
        title: 'Test Battle',
        description: 'Test Description',
        aCode: 'codeA',
        bCode: 'codeB',
        language: 'typescript',
        category: 'algorithm',
        participantCount: 0,
        currentRound: 1,
        totalRounds: 1,
        topics: ['효율성'],
        currentPhase: 'OPINION_SHARE' as const,
        phaseCount: 1,
        timelines: { attacks: [], defenses: [] },
        referenceData: null,
      }

      const getJoinBattleInfoSpy = jest.spyOn(queryUseCase, 'getJoinBattleInfo')
      getJoinBattleInfoSpy.mockResolvedValue(mockResult)

      const result = await controller.joinBattleInfo('battle-1')

      expect(getJoinBattleInfoSpy).toHaveBeenCalledWith('battle-1')
      expect(result).toBe(mockResult)
    })
  })

  describe('GET /battles/:id/result', () => {
    it('배틀 결과를 반환한다', async () => {
      const mockResult = {
        battleId: 'battle-1',
        status: 'CLOSED' as const,
      }

      const getBattleResultSpy = jest.spyOn(queryUseCase, 'getBattleResult')
      getBattleResultSpy.mockResolvedValue(mockResult as BattleResultResponseDto)

      const result = await controller.getBattleResult('battle-1')

      expect(getBattleResultSpy).toHaveBeenCalledWith('battle-1')
      expect(result.battleId).toBe('battle-1')
    })

    it('존재하지 않는 배틀 조회 시 404 에러를 반환한다', async () => {
      queryUseCase.getBattleResult.mockRejectedValue(new NotFoundException())

      await expect(controller.getBattleResult('battle-999')).rejects.toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 400 에러를 반환한다', async () => {
      queryUseCase.getBattleResult.mockRejectedValue(new BadRequestException())

      await expect(controller.getBattleResult('battle-open-1')).rejects.toThrow(BadRequestException)
    })
  })
})
