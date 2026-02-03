import { Injectable } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { BattleIdentifierPort } from '../../../application/ports/out/battleIdentifier.port'

@Injectable()
export class BattleIdentifierAdapter implements BattleIdentifierPort {
  generateId(): string {
    return uuidv7()
  }

  generateInviteCode(): string {
    // 밀리초 단위 타임스탬프 기반 코드 생성
    return Date.now().toString()
  }
}
