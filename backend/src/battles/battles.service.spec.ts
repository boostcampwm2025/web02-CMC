import { BattlesService } from './battles.service'
import type { CreateBattleRequest } from './types'

describe('BattlesService', () => {
  let service: BattlesService

  beforeEach(() => {
    service = new BattlesService()
  })

  const basePayload: CreateBattleRequest = {
    authorId: 'user-1',
    title: '배틀 제목',
    description: '배틀 설명',
    aCode: 'code-a',
    bCode: 'code-b',
    language: 'typescript',
    type: '리팩토링',
    category: '성능',
    playTime: 10,
  }

  it('비밀번호가 없으면 공개 배틀을 생성한다', () => {
    const battle = service.create(basePayload)

    expect(battle.id).toBeDefined()
    expect(battle.isPublic).toBe(true)
    expect(battle.password).toBeUndefined()
    expect(battle.participantCount).toBe(1)
    expect(battle.initialState).toEqual({
      round: 1,
      phase: 'WAITING_FOR_START',
      timeRemainingSeconds: 10 * 60,
    })
    expect(battle.status).toBe('PENDING')
  })

  it('비밀번호가 있으면 비공개 배틀을 생성한다', () => {
    const battle = service.create({
      ...basePayload,
      password: 'secret',
    })

    expect(battle.isPublic).toBe(false)
    expect(battle.password).toBe('secret')
  })
})
