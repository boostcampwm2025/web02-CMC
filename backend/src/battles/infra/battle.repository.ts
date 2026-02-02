import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma, type Battle as PrismaBattle } from 'generated/prisma/client'

@Injectable()
export class BattleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(battleId: string): Promise<PrismaBattle> {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) {
      throw new NotFoundException('배틀이 존재하지 않습니다.')
    }
    return battle
  }

  async findMany(args: {
    where?: { isPrivate?: boolean; status?: { in?: string[] } }
    orderBy?: { createdAt?: 'asc' | 'desc'; finishedAt?: 'asc' | 'desc' }
    skip?: number
    take?: number
  }) {
    return this.prisma.battle.findMany(args)
  }

  async findBattleList(params: {
    onlyPublic?: boolean
    status?: string | { in?: string[] }
    limit: number
    offset: number
    orderBy?: { createdAt?: 'asc' | 'desc' } | { finishedAt?: 'asc' | 'desc' }
  }) {
    return this.prisma.battle.findMany({
      where: {
        isPrivate: params.onlyPublic ? false : undefined,
        status: params.status,
      },
      orderBy: params.orderBy || { createdAt: 'desc' },
      skip: params.offset,
      take: params.limit,
    })
  }

  async countBattleList(params: { onlyPublic?: boolean; status?: string | { in?: string[] } }): Promise<number> {
    return this.prisma.battle.count({
      where: {
        isPrivate: params.onlyPublic ? false : undefined,
        status: params.status,
      },
    })
  }

  async count(args: { where?: { isPrivate?: boolean; status?: { in?: string[] } } }) {
    return this.prisma.battle.count(args)
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
    return this.prisma.battle.update({
      where: { id: battleId },
      data,
    })
  }

  async findUniqueByInviteCode(inviteCode: string): Promise<PrismaBattle | null> {
    return this.prisma.battle.findUnique({ where: { inviteCode } })
  }

  async findUniqueUser(userId: string, select?: { id?: boolean; rating?: boolean; tier?: boolean }) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: select || { id: true },
    })
  }

  async findManyUsers(args: { where?: { id?: { in?: string[] } }; select?: { id?: true; rating?: true; tier?: true } }) {
    return this.prisma.user.findMany(args)
  }

  async updateUser(userId: string, data: { rating?: number; tier?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    })
  }

  async upsertBattleParticipant(args: { userId: string; battleId: string; team: string; isMvp: boolean }) {
    return this.prisma.battleParticipant.upsert({
      where: { userId_battleId: { userId: args.userId, battleId: args.battleId } },
      update: { team: args.team, isMvp: args.isMvp },
      create: {
        userId: args.userId,
        battleId: args.battleId,
        team: args.team,
        isMvp: args.isMvp,
      },
    })
  }

  async updateManyBattleParticipants(args: { where: { battleId: string; userId?: { in?: string[] } }; data: { isMvp: boolean } }) {
    return this.prisma.battleParticipant.updateMany(args)
  }

  async transaction<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn)
  }
}
