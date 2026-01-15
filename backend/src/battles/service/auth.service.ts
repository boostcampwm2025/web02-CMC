import { v7 as uuidv7 } from 'uuid'
import { Injectable } from '@nestjs/common'
import { GuestAccount } from '../types/auth.types'

@Injectable()
export class AuthService {
  private guests = new Map<string, GuestAccount>()

  //Guest 생성 (clientId 생성)
  createGuest(nickname: string): GuestAccount {
    const clientId = this.generateId()
    const guest: GuestAccount = {
      id: clientId,
      nickname: nickname.trim(),
      createdAt: Date.now(),
    }

    // guests Map에 저장
    this.guests.set(clientId, guest)
    return guest
  }

  //배틀 방 내 닉네임 중복 체크
  isNicknameDuplicateInBattle(battleClientIds: string[], nickname: string): boolean {
    const trimmedNickname = nickname.trim()

    return battleClientIds.some(clientId => {
      const guest = this.guests.get(clientId)
      return guest?.nickname === trimmedNickname
    })
  }

  private generateId(): string {
    return uuidv7()
  }
}
