import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { BattlesService } from './battles.service'

describe('BattlesService', () => {
  let service: BattlesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattlesService],
    }).compile()

    service = module.get<BattlesService>(BattlesService)
  })

  it('서비스가 정의되어야 함', () => {
    expect(service).toBeDefined()
  })

  describe('getBattleResult', () => {
    it('종료된 배틀의 결과를 반환해야 함', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.battleId).toBe('battle-1')
      expect(result.status).toBe('CLOSED')
      expect(result).toHaveProperty('codeA')
      expect(result).toHaveProperty('codeB')
      expect(result).toHaveProperty('result')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('voteTimeline')
      expect(result).toHaveProperty('timeline')
      expect(result).toHaveProperty('mvp')
    })

    it('존재하지 않는 배틀 조회 시 NotFoundException을 던져야 함', async () => {
      await expect(service.getBattleResult('battle-999')).rejects.toThrow(NotFoundException)
    })

    it('진행 중인 배틀 조회 시 BadRequestException을 던져야 함', async () => {
      await expect(service.getBattleResult('battle-open-1')).rejects.toThrow(BadRequestException)
    })

    it('투표 비율이 올바르게 계산되어야 함', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.result.teamA.percentage).toBe(44)
      expect(result.result.teamB.percentage).toBe(40)
      expect(result.result.neutral.percentage).toBe(16)
    })

    it('타임라인이 시간순(오래된순)으로 정렬되어야 함', async () => {
      const result = await service.getBattleResult('battle-1')
      const timestamps = result.timeline.map(item => new Date(item.createdAt).getTime())
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b)
      expect(timestamps).toEqual(sortedTimestamps)
    })

    it('MVP가 올바르게 계산되어야 함 (최다 upvotes)', async () => {
      const result = await service.getBattleResult('battle-1')
      expect(result.mvp.nickname).toBe('CodeMaster')
      expect(result.mvp.totalVotes).toBe(25)
      expect(result.mvp.team).toBe('A')
    })

    it('투표 추세가 누적값으로 반환되어야 함', async () => {
      const result = await service.getBattleResult('battle-1')
      // 턴 1 < 턴 2 < 턴 3 (누적값 증가)
      expect(result.voteTimeline[0].teamAVotes).toBeLessThan(result.voteTimeline[1].teamAVotes)
      expect(result.voteTimeline[1].teamAVotes).toBeLessThan(result.voteTimeline[2].teamAVotes)
    })

    it('타임라인에 ATTACK과 DEFENSE만 포함되어야 함', async () => {
      const result = await service.getBattleResult('battle-1')
      result.timeline.forEach(item => {
        expect(['ATTACK', 'DEFENSE']).toContain(item.type)
      })
    })
  })
})
