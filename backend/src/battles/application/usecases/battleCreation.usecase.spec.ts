/* eslint-disable @typescript-eslint/unbound-method */
import { BattleCreationUseCase } from './battleCreation.usecase'
import { BATTLE_STATUS, BATTLE_TYPE } from '../../domains/models/const/battles.const'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleReferencePort } from '../ports/out/battleReference.port'
import type { BattleIdentifierPort } from '../ports/out/battleIdentifier.port'
import type { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'
import type { BattleCreateQueryDto } from '../../dto/battleCreateQuery.dto'
import type { ActiveBattleState } from '../../domains/models/types/battle.types'

describe('BattleCreationUseCase', () => {
  let useCase: BattleCreationUseCase
  let repo: jest.Mocked<BattleRepoPort>
  let stateRepo: jest.Mocked<BattleStatePort>
  let broadcaster: jest.Mocked<BattleBroadcasterPort>
  let referencePort: jest.Mocked<BattleReferencePort>
  let identifierPort: jest.Mocked<BattleIdentifierPort>
  let phaseTransitionUseCase: jest.Mocked<BattlePhaseTransitionUseCase>

  const createMockPayload = (overrides = {}): BattleCreateQueryDto =>
    ({
      authorId: 'user-1',
      title: '테스트 배틀',
      description: '설명',
      aCode: 'code A',
      bCode: 'code B',
      language: 'javascript',
      category: 'algorithm',
      playTime: 'FIFTEEN_MIN',
      topics: ['topic1'],
      type: BATTLE_TYPE.PUBLIC,
      ...overrides,
    }) as unknown as BattleCreateQueryDto

  const createMockState = (): ActiveBattleState =>
    ({
      battleId: 'battle-id-123',
      round: 1,
      phase: 'PENDING',
      phaseCount: 1,
      startedAt: null,
      expiredAt: null,
      topics: ['topic1'],
      participants: new Map(),
      userInfoMap: new Map(),
      teamA: { users: [] },
      teamB: { users: [] },
    }) as unknown as ActiveBattleState

  beforeEach(() => {
    repo = {
      create: jest.fn().mockResolvedValue({
        id: 'battle-id-123',
        userId: 'user-1',
        title: '테스트 배틀',
        description: '설명',
        codeA: 'code A',
        codeB: 'code B',
        language: 'javascript',
        category: 'algorithm',
        playTime: 'FIFTEEN_MIN',
        topics: ['topic1'],
        inviteCode: null,
        isPrivate: false,
        status: BATTLE_STATUS.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<BattleRepoPort>

    stateRepo = {
      loadBattleState: jest.fn().mockResolvedValue({
        battle: {},
        state: createMockState(),
      }),
      saveBattleState: jest.fn(),
    } as unknown as jest.Mocked<BattleStatePort>

    broadcaster = {
      emitPhaseUpdated: jest.fn(),
      emitRoundUpdated: jest.fn(),
    } as unknown as jest.Mocked<BattleBroadcasterPort>

    referencePort = {
      generate: jest.fn().mockResolvedValue({
        referenceData: {
          summary: 'AI 요약',
          keyPoints: ['point1', 'point2'],
        },
        rateLimit: {
          limitPerMinute: 5,
          remainingMinute: 4,
          limitPerDay: 20,
          remainingDay: 19,
        },
      }),
    } as unknown as jest.Mocked<BattleReferencePort>

    identifierPort = {
      generateId: jest.fn().mockReturnValue('battle-id-123'),
      generateInviteCode: jest.fn().mockReturnValue('INVITE123'),
    } as unknown as jest.Mocked<BattleIdentifierPort>

    phaseTransitionUseCase = {
      advancePhase: jest.fn(),
    } as unknown as jest.Mocked<BattlePhaseTransitionUseCase>

    useCase = new BattleCreationUseCase(repo, stateRepo, broadcaster, referencePort, identifierPort, phaseTransitionUseCase)
  })

  describe('create', () => {
    it('배틀을 생성하고 엔티티를 반환한다', async () => {
      const payload = createMockPayload()

      const result = await useCase.create(payload)

      expect(identifierPort.generateId).toHaveBeenCalled()
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'battle-id-123',
          userId: 'user-1',
          title: '테스트 배틀',
          status: BATTLE_STATUS.PENDING,
        }),
      )
      expect(result.battle.id).toBe('battle-id-123')
      expect(result.aiRateLimit).toEqual({
        limitPerMinute: 5,
        remainingMinute: 4,
        limitPerDay: 20,
        remainingDay: 19,
      })
    })

    it('비공개 배틀 생성 시 초대 코드를 생성한다', async () => {
      const payload = createMockPayload({ type: BATTLE_TYPE.PRIVATE })

      await useCase.create(payload)

      expect(identifierPort.generateInviteCode).toHaveBeenCalled()
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          inviteCode: 'INVITE123',
          isPrivate: true,
        }),
      )
    })

    it('공개 배틀 생성 시 초대 코드가 null이다', async () => {
      const payload = createMockPayload({ type: BATTLE_TYPE.PUBLIC })

      await useCase.create(payload)

      expect(identifierPort.generateInviteCode).not.toHaveBeenCalled()
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          inviteCode: null,
          isPrivate: false,
        }),
      )
    })

    it('AI 참고 자료 생성에 실패해도 배틀 생성은 계속 진행된다', async () => {
      referencePort.generate.mockRejectedValue(new Error('AI error'))
      const payload = createMockPayload()

      const result = await useCase.create(payload)

      expect(result.battle.id).toBe('battle-id-123')
      expect(result.aiRateLimit).toBeNull()
      expect(repo.create).toHaveBeenCalledWith(expect.not.objectContaining({ referenceData: expect.anything() }))
    })
  })

  describe('start', () => {
    it('배틀을 시작하고 상태를 업데이트한다', async () => {
      await useCase.start('battle-id-123')

      expect(stateRepo.loadBattleState).toHaveBeenCalledWith('battle-id-123')
      expect(repo.update).toHaveBeenCalledWith('battle-id-123', expect.objectContaining({ status: BATTLE_STATUS.OPEN }))
      expect(stateRepo.saveBattleState).toHaveBeenCalled()
    })

    it('phase와 round 업데이트를 브로드캐스트한다', async () => {
      await useCase.start('battle-id-123')

      expect(broadcaster.emitPhaseUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          battleId: 'battle-id-123',
          phase: 'PENDING',
        }),
      )
      expect(broadcaster.emitRoundUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          battleId: 'battle-id-123',
          round: 1,
        }),
      )
    })

    it('배틀 시작 시 첫 페이즈로 전환한다', async () => {
      const mockState = createMockState()
      stateRepo.loadBattleState.mockResolvedValue({
        battle: {},
        state: mockState,
      } as unknown as Awaited<ReturnType<BattleStatePort['loadBattleState']>>)

      await useCase.start('battle-id-123')

      expect(phaseTransitionUseCase.advancePhase).toHaveBeenCalledWith('battle-id-123')
    })
  })
})
