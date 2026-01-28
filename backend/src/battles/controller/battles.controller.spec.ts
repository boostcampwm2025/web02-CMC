import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import type { Response } from 'express'
import type { BattleLanguage, BattleCategory } from '../types/battles.types'
import { BattlesController } from './battles.controller'
import { BattlesService } from '../service/battles.service'
import { BattleListRequestQueryDto } from '../dto/battleListRequestQuery.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import { BATTLE_TYPE } from '../const/battles.const'
import { InviteAccessGuard } from '../guards/inviteAccess.guard'

describe('BattlesController', () => {
  let controller: BattlesController
  let service: jest.Mocked<BattlesService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [
        {
          provide: BattlesService,
          useValue: {
            create: jest.fn(),
            getOpenBattles: jest.fn(),
            getClosedBattles: jest.fn(),
            getBattleResult: jest.fn(),
            getBattleByInviteCode: jest.fn(),
            joinBattleInfo: jest.fn(),
            isPrivateBattle: jest.fn(),
          },
        },
        {
          provide: InviteAccessGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    })
      .overrideGuard(InviteAccessGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .compile()

    controller = module.get(BattlesController)
    service = module.get(BattlesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getOpenBattles', () => {
    it('query.limit/offset을 getOpenBattles로 전달하고 결과를  반환한다', async () => {
      const query: BattleListRequestQueryDto = {
        limit: 10,
        offset: 0,
      }

      const mockResult = {
        battles: [],
        meta: {
          limit: 10,
          offset: 0,
          total: 0,
        },
      }

      const spy = jest.spyOn(service, 'getOpenBattles').mockResolvedValue(mockResult as never)

      const result = await controller.getOpenBattles(query)

      expect(spy).toHaveBeenCalledWith(10, 0)
      expect(result).toBe(mockResult)
    })
  })

  describe('getClosedBattles', () => {
    it('query.limit/offset을 getClosedBattles로 전달하고 결과를 반환한다', async () => {
      const query: BattleListRequestQueryDto = {
        limit: 5,
        offset: 20,
      }

      const mockResult = {
        battles: [],
        meta: {
          limit: 5,
          offset: 20,
          total: 0,
        },
      }

      const spy = jest.spyOn(service, 'getClosedBattles').mockResolvedValue(mockResult as never)

      const result = await controller.getClosedBattles(query)

      expect(spy).toHaveBeenCalledWith(5, 20)
      expect(result).toBe(mockResult)
    })
  })

  describe('createBattle', () => {
    it('배틀을 생성하고 battleId와 inviteCode를 반환한다', async () => {
      const mockBattle = {
        id: 'battle-1',
        inviteCode: 'test-invite-code-1234',
        type: BATTLE_TYPE.PRIVATE,
      }

      const jsonMock = jest.fn()
      const res = {
        json: jsonMock,
      } as unknown as Response

      jest.spyOn(service, 'create').mockResolvedValue(mockBattle as never)

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

      expect(jsonMock).toHaveBeenCalledWith({
        battleId: 'battle-1',
        inviteCode: 'test-invite-code-1234',
      })
    })

    it('공개 배틀 생성 시 battleId와 inviteCode를 반환한다', async () => {
      const mockBattle = {
        id: 'battle-1',
        inviteCode: null,
        type: BATTLE_TYPE.PUBLIC,
      }

      const jsonMock = jest.fn()
      const res = {
        json: jsonMock,
      } as unknown as Response

      jest.spyOn(service, 'create').mockResolvedValue(mockBattle as never)

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

      expect(jsonMock).toHaveBeenCalledWith({
        battleId: 'battle-1',
        inviteCode: null,
      })
    })
  })

  describe('getBattleByInviteCode', () => {
    it('inviteCode로 배틀을 찾고 리다이렉트한다', async () => {
      const mockResult = { battleId: 'battle-1' }
      const getBattleByInviteCodeSpy = jest.spyOn(service, 'getBattleByInviteCode').mockResolvedValue(mockResult)

      const redirectMock = jest.fn()
      const res = {
        redirect: redirectMock,
      } as unknown as Response

      await controller.getBattleByInviteCode('test-invite-code', res)

      expect(getBattleByInviteCodeSpy).toHaveBeenCalledWith('test-invite-code')
      expect(redirectMock).toHaveBeenCalledWith(303, 'http://localhost:5173/battle/battle-1/team-select')
    })

    it('존재하지 않는 inviteCode면 NotFoundException을 던진다', async () => {
      jest.spyOn(service, 'getBattleByInviteCode').mockRejectedValue(new NotFoundException())

      const redirectMock = jest.fn()
      const res = {
        redirect: redirectMock,
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
        currentPhase: 'OPINION_SHARE',
        phaseCount: 1,
        timelines: { attacks: [], defenses: [] },
      }

      const joinBattleInfoSpy = jest.spyOn(service, 'joinBattleInfo').mockResolvedValue(mockResult as never)

      const result = await controller.joinBattleInfo('battle-1')

      expect(joinBattleInfoSpy).toHaveBeenCalledWith('battle-1')
      expect(result).toBe(mockResult)
    })
  })

  describe('GET /battles/:id/result', () => {
    it('배틀 결과를 200 상태코드와 함께 반환해야 함', async () => {
      const mockResult = {
        battleId: 'battle-1',
        status: 'CLOSED' as const,
      }

      jest.spyOn(service, 'getBattleResult').mockResolvedValue(mockResult as BattleResultResponseDto)

      const result = await controller.getBattleResult('battle-1')
      expect(result).toBeDefined()
      expect(result.battleId).toBe('battle-1')
    })

    it('존재하지 않는 배틀 조회 시 404 에러를 반환해야 함', async () => {
      jest.spyOn(service, 'getBattleResult').mockRejectedValue(new NotFoundException() as never)

      await expect(controller.getBattleResult('battle-999')).rejects.toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 400 에러를 반환해야 함', async () => {
      jest.spyOn(service, 'getBattleResult').mockRejectedValue(new BadRequestException() as never)

      await expect(controller.getBattleResult('battle-open-1')).rejects.toThrow(BadRequestException)
    })
  })
})
