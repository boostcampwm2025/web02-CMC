import { Injectable, Inject } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { BATTLE_STATUS, BATTLE_PHASE, BATTLE_TYPE } from '../../domains/models/const/battles.const'
import { Battle, BattleCategory, BattleLanguage } from '../../domains/models/types/battle.types'
import type { BattleCreateQueryDto } from '../../dto/battleCreateQuery.dto'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../dto/battleTurnResponse.dto'
import { BATTLE_REPO_PORT, BATTLE_STATE_PORT, BATTLE_BROADCASTER_PORT, BATTLE_IDENTIFIER_PORT, KAFKA_PUB_PORT } from '../ports/tokens'
import type { BattleRepoPort } from '../ports/out/battleRepository.port'
import type { BattleStatePort } from '../ports/out/battleState.port'
import type { BattleBroadcasterPort } from '../ports/out/battleBroadcaster.port'
import type { BattleIdentifierPort } from '../ports/out/battleIdentifier.port'
import type { KafkaPubPort } from '../ports/out/kafkaPublish.port'

import { shuffleTopics } from '../../domains/services/utils/battle.util'
import { toBattleEntity } from '../mappers/battle.mapper'
import { BattlePhaseTransitionUseCase } from './battlePhaseTransition.usecase'

export interface BattleCreationResult {
  battle: Battle
  // aiRateLimit: GeminiRateLimitInfo | null
  aiRateLimit: null
}

@Injectable()
export class BattleCreationUseCase {
  constructor(
    @Inject(BATTLE_REPO_PORT) private readonly repo: BattleRepoPort,
    @Inject(BATTLE_STATE_PORT) private readonly stateRepo: BattleStatePort,
    @Inject(BATTLE_BROADCASTER_PORT) private readonly broadcaster: BattleBroadcasterPort,
    @Inject(BATTLE_IDENTIFIER_PORT) private readonly identifierPort: BattleIdentifierPort,
    @Inject(KAFKA_PUB_PORT) private readonly kafkaPubPort: KafkaPubPort,
    private readonly phaseTransitionUseCase: BattlePhaseTransitionUseCase,
  ) {}

  //배틀 생성
  async create(payload: BattleCreateQueryDto): Promise<BattleCreationResult> {
    const now = new Date()
    const battleId = this.identifierPort.generateId()
    const shuffledTopics = shuffleTopics(payload.topics, payload.playTime)
    const isPrivate = payload.type === BATTLE_TYPE.PRIVATE

    // let referenceData: BattleReferenceData | null = null
    // let aiRateLimit: GeminiRateLimitInfo | null = null
    // try {
    //   const title = String(payload.title)
    //   const description = String(payload.description)
    //   const codeA = String(payload.aCode)
    //   const codeB = String(payload.bCode)
    //   const language = String(payload.language)
    //   const category = String(payload.category)
    //   const generated = await this.referencePort.generate({
    //     title,
    //     description,
    //     codeA,
    //     codeB,
    //     language,
    //     category,
    //     topics: payload.topics,
    //   })
    //   referenceData = generated.referenceData
    //   aiRateLimit = generated.rateLimit
    // } catch {
    //   // AI 참고 자료 생성 실패 시 null로 유지하고 배틀 생성은 계속 진행
    // }

    const inviteCode: string | null = isPrivate ? this.identifierPort.generateInviteCode() : null

    const createData: Parameters<BattleRepoPort['create']>[0] = {
      id: battleId,
      userId: String(payload.authorId),
      title: String(payload.title).trim(),
      description: String(payload.description).trim(),
      codeA: String(payload.aCode),
      codeB: String(payload.bCode),
      language: String(payload.language),
      category: String(payload.category),
      playTime: String(payload.playTime),
      topics: shuffledTopics,
      inviteCode,
      isPrivate,
      status: BATTLE_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
      currentRound: 1,
      currentPhase: BATTLE_PHASE.PENDING.name,
      phaseCount: 1,
      startedAt: null,
      expiredAt: null,
      participantsState: [] as Prisma.InputJsonValue,
      teamVotesState: [] as Prisma.InputJsonValue,
      userInfoState: [] as Prisma.InputJsonValue,
      attacksState: { teamA: [], teamB: [], all: [] } as Prisma.InputJsonValue,
      defensesState: { teamA: [], teamB: [], all: [] } as Prisma.InputJsonValue,
      opinionHistoryState: [] as Prisma.InputJsonValue,
      chatsAllState: [] as Prisma.InputJsonValue,
      chatsTeamAState: [] as Prisma.InputJsonValue,
      chatsTeamBState: [] as Prisma.InputJsonValue,
      referenceData: null,
    }

    // if (referenceData !== null) {
    //   createData.referenceData = referenceData as unknown as Prisma.InputJsonValue
    //}
    const created = await this.repo.create(createData)

    //배틀 생성 이벤트 발행 -> AI 레퍼런스 컨슈머
    await this.kafkaPubPort.publishBattleCreated({
      battleId: created.id,
      title: created.title,
      description: created.description,
      codeA: created.codeA,
      codeB: created.codeB,
      language: created.language as BattleLanguage,
      category: created.category as BattleCategory,
      topics: payload.topics,
    })

    const battleEntity = toBattleEntity(created, 1)
    return { battle: battleEntity, aiRateLimit: null }
  }

  //배틀 시작
  async start(battleId: string): Promise<void> {
    const { state } = await this.stateRepo.loadBattleState(battleId)

    const startedAt = Date.now()
    const expiredAt = startedAt + BATTLE_PHASE.PENDING.time

    state.startedAt = startedAt
    state.expiredAt = expiredAt
    await this.repo.update(battleId, {
      status: BATTLE_STATUS.OPEN,
      updatedAt: new Date(),
    })
    this.stateRepo.saveBattleState(battleId, state)

    const phaseRes = BattlePhaseResponseDto.of({
      battleId,
      phase: state.phase,
      phaseCount: state.phaseCount,
      startedAt,
      expiredAt,
    })

    const roundRes = BattleRoundResponseDto.of({
      battleId,
      round: 1,
      topic: state.topics[0],
    })

    this.broadcaster.emitPhaseUpdated(phaseRes)
    this.broadcaster.emitRoundUpdated(roundRes)

    // 배틀 시작 시 첫 페이즈로 전환 (PENDING → OPINION_SHARE)
    await this.phaseTransitionUseCase.advancePhase(battleId)
  }
}
