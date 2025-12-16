import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Battle, BattleStatus, CreateBattleRequest } from './types'

@Injectable()
export class BattlesService {
  private readonly battles: Battle[] = []

  create(payload: CreateBattleRequest): Battle {
    const now = new Date()
    const status: BattleStatus = 'PENDING'
    const isPublic = !payload.password

    const battle: Battle = {
      id: randomUUID(),
      authorId: payload.authorId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      aCode: payload.aCode,
      bCode: payload.bCode,
      language: payload.language.trim(),
      type: payload.type.trim(),
      category: payload.category.trim(),
      playTime: payload.playTime,
      isPublic,
      password: isPublic ? undefined : payload.password?.trim(),
      status,
      createdAt: now,
      updatedAt: now,
      participantCount: 1,
      initialState: {
        round: 1,
        phase: 'WAITING_FOR_START',
        timeRemainingSeconds: payload.playTime * 60,
      },
    }

    this.battles.push(battle)

    return battle
  }
}
