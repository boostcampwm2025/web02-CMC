import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, type Battle as PrismaBattle } from 'generated/prisma/client'
import { PrismaService } from '../../../../prisma/prisma.service'
import { BattleRepoPort } from '../../../application/ports/out/battleRepository.port'

@Injectable()
export class BattleRepositoryAdapter implements BattleRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(battleId: string): Promise<PrismaBattle> {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')
    return battle
  }

  async findBattleList(params: {
    onlyPublic?: boolean
    status?: string | { in?: string[] }
    limit: number
    offset: number
    orderBy?: { createdAt?: 'asc' | 'desc' } | { finishedAt?: 'asc' | 'desc' }
  }): Promise<PrismaBattle[]> {
    const where: Prisma.BattleWhereInput = {}
    if (params.onlyPublic !== undefined) {
      where.isPrivate = !params.onlyPublic
    }
    if (params.status) {
      if (typeof params.status === 'string') {
        where.status = params.status
      } else if (params.status.in) {
        where.status = { in: params.status.in }
      }
    }

    const orderBy: Prisma.BattleOrderByWithRelationInput = params.orderBy || { createdAt: 'desc' }

    return this.prisma.battle.findMany({
      where,
      orderBy,
      skip: params.offset,
      take: params.limit,
    })
  }

  async countBattleList(params: { onlyPublic?: boolean; status?: string | { in?: string[] } }): Promise<number> {
    const where: Prisma.BattleWhereInput = {}
    if (params.onlyPublic !== undefined) {
      where.isPrivate = !params.onlyPublic
    }
    if (params.status) {
      if (typeof params.status === 'string') {
        where.status = params.status
      } else if (params.status.in) {
        where.status = { in: params.status.in }
      }
    }

    return this.prisma.battle.count({ where })
  }

  async findUniqueByInviteCode(inviteCode: string): Promise<PrismaBattle | null> {
    return this.prisma.battle.findUnique({ where: { inviteCode } })
  }

  async create(data: {
    id: string
    userId: string
    title: string
    description: string
    codeA: string
    codeB: string
    language: string
    category: string
    playTime: string
    topics: string[]
    inviteCode: string | null
    isPrivate: boolean
    status: string
    createdAt: Date
    updatedAt: Date
    currentRound: number
    currentPhase: string
    phaseCount: number
    startedAt: Date | null
    expiredAt: Date | null
    participantsState: Prisma.InputJsonValue
    teamVotesState: Prisma.InputJsonValue
    userInfoState: Prisma.InputJsonValue
    attacksState: Prisma.InputJsonValue
    defensesState: Prisma.InputJsonValue
    opinionHistoryState: Prisma.InputJsonValue
    chatsAllState: Prisma.InputJsonValue
    chatsTeamAState: Prisma.InputJsonValue
    chatsTeamBState: Prisma.InputJsonValue
    referenceData?: Prisma.InputJsonValue
  }): Promise<PrismaBattle> {
    return this.prisma.battle.create({ data })
  }

  async update(
    battleId: string,
    data: Partial<{
      status: string
      currentRound: number | null
      currentPhase: string | null
      phaseCount: number | null
      startedAt: Date | null
      expiredAt: Date | null
      participantsState: Prisma.InputJsonValue
      teamVotesState: Prisma.InputJsonValue
      userInfoState: Prisma.InputJsonValue
      attacksState: Prisma.InputJsonValue
      defensesState: Prisma.InputJsonValue
      opinionHistoryState: Prisma.InputJsonValue
      chatsAllState: Prisma.InputJsonValue
      chatsTeamAState: Prisma.InputJsonValue
      chatsTeamBState: Prisma.InputJsonValue
      skipState: string[]
      updatedAt: Date
      finishedAt: Date | null
      teamACount: number
      teamBCount: number
      totalParticipantsCount: number
      winningTeam: string | null
      timeline: Prisma.InputJsonValue
      mvps: string[]
      mvpsState: Prisma.InputJsonValue
    }>,
  ): Promise<PrismaBattle> {
    return this.prisma.battle.update({ where: { id: battleId }, data })
  }

  async findUniqueUser(
    userId: string,
    select?: { id?: boolean; rating?: boolean; tier?: boolean },
  ): Promise<{ id: string; rating?: number | null; tier?: string | null } | null> {
    const selectFields: Prisma.UserSelect = {}
    if (select?.id !== undefined) selectFields.id = select.id
    if (select?.rating !== undefined) selectFields.rating = select.rating
    if (select?.tier !== undefined) selectFields.tier = select.tier

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: Object.keys(selectFields).length > 0 ? selectFields : undefined,
    })
  }

  async findManyUsers(args: {
    where?: { id?: { in?: string[] } }
    select?: { id?: true; rating?: true; tier?: true }
  }): Promise<Array<{ id: string; rating: number | null; tier: string | null }>> {
    const selectFields: Prisma.UserSelect = {}
    if (args.select?.id !== undefined) selectFields.id = args.select.id
    if (args.select?.rating !== undefined) selectFields.rating = args.select.rating
    if (args.select?.tier !== undefined) selectFields.tier = args.select.tier

    return this.prisma.user.findMany({
      where: args.where,
      select: Object.keys(selectFields).length > 0 ? selectFields : { id: true, rating: true, tier: true },
    }) as Promise<Array<{ id: string; rating: number | null; tier: string | null }>>
  }

  async updateUser(userId: string, data: { rating?: number; tier?: string }): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data })
  }

  async upsertBattleParticipant(args: { userId: string; battleId: string; team: string; isMvp: boolean }): Promise<void> {
    await this.prisma.battleParticipant.upsert({
      where: { userId_battleId: { userId: args.userId, battleId: args.battleId } },
      create: {
        userId: args.userId,
        battleId: args.battleId,
        team: args.team,
        isMvp: args.isMvp,
      },
      update: {
        team: args.team,
        isMvp: args.isMvp,
      },
    })
  }

  async updateManyBattleParticipants(args: { where: { battleId: string; userId?: { in?: string[] } }; data: { isMvp: boolean } }): Promise<void> {
    const where: Prisma.BattleParticipantWhereInput = { battleId: args.where.battleId }
    if (args.where.userId?.in) {
      where.userId = { in: args.where.userId.in }
    }

    await this.prisma.battleParticipant.updateMany({
      where,
      data: args.data,
    })
  }

  async transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn)
  }
}
