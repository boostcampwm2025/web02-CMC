import { Controller, Post, HttpCode, Param } from '@nestjs/common'
import type { GuestAccount } from '../../domains/models/types/auth.types'
import { CreateGuestUseCase } from '../../application/usecases/createGuest.usecase'

@Controller('auth')
export class GuestController {
  constructor(private readonly createGuestUseCase: CreateGuestUseCase) {}

  @Post('guest/:battleId')
  @HttpCode(200)
  async createGuest(@Param('battleId') battleId: string): Promise<GuestAccount> {
    return this.createGuestUseCase.execute(battleId)
  }
}
