import { v7 as uuidv7 } from 'uuid'
import { Injectable } from '@nestjs/common'
import { GuestAccount } from '../types/auth.types'

@Injectable()
export class AuthService {
  //Guest 생성 (clientId 생성)
  createGuest(nickname: string): GuestAccount {
    const clientId = this.generateId()
    const guest: GuestAccount = {
      id: clientId,
      nickname: nickname.trim(),
      createdAt: Date.now(),
    }

    return guest
  }

  private generateId(): string {
    return uuidv7()
  }
}
