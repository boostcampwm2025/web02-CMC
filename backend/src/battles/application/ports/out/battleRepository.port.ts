import { Prisma, type Battle as PrismaBattle } from 'generated/prisma/client'

export interface BattleRepoPort {
  transaction<T>(fn: (txRepo: BattleRepoPort) => Promise<T>): Promise<T>

  //배틀 조회
  findUnique(battleId: string): Promise<PrismaBattle>

  //배틀 목록 조회
  findBattleList(params: {
    onlyPublic?: boolean
    status?: string | { in?: string[] }
    limit: number
    offset: number
    orderBy?: { createdAt?: 'asc' | 'desc' } | { finishedAt?: 'asc' | 'desc' }
  }): Promise<PrismaBattle[]>

  //배틀 목록 개수 조회
  countBattleList(params: { onlyPublic?: boolean; status?: string | { in?: string[] } }): Promise<number>

  //배틀 초대 코드로 조회
  findUniqueByInviteCode(inviteCode: string): Promise<PrismaBattle | null>

  //배틀 생성
  create(data: {
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
  }): Promise<PrismaBattle>

  //배틀 업데이트
  update(
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
  ): Promise<PrismaBattle>

  //사용자 조회
  findUniqueUser(
    userId: string,
    select?: { id?: boolean; rating?: boolean; tier?: boolean },
  ): Promise<{ id: string; rating?: number | null; tier?: string | null } | null>

  //사용자 목록 조회
  findManyUsers(args: {
    where?: { id?: { in?: string[] } }
    select?: { id?: true; rating?: true; tier?: true }
  }): Promise<Array<{ id: string; rating: number | null; tier: string | null }>>

  //사용자 업데이트
  updateUser(userId: string, data: { rating?: number; tier?: string }): Promise<void>

  //배틀 참가자 추가
  upsertBattleParticipant(args: { userId: string; battleId: string; team: string; isMvp: boolean }): Promise<void>

  //배틀 참가자 업데이트
  updateManyBattleParticipants(args: { where: { battleId: string; userId?: { in?: string[] } }; data: { isMvp: boolean } }): Promise<void>

  //배틀 삭제 (DEV ONLY) — BattleParticipant cascade 삭제
  delete(battleId: string): Promise<void>
}
