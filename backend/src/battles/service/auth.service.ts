import { v7 as uuidv7 } from 'uuid'
import { Injectable } from '@nestjs/common'
import { GuestAccount } from '../types/auth.types'

@Injectable()
export class AuthService {
  constructor() {}

  //Guest 생성
  createGuest(nickname: string): GuestAccount {
    const id = this.generateId()

    const guest: GuestAccount = {
      id,
      nickname,
      createdAt: Date.now(),
    }

    return guest
  }

  private generateId(): string {
    return uuidv7()
  }
}
