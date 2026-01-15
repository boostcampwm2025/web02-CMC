import { Body, Controller, Post, HttpCode, Param, BadRequestException, NotFoundException } from '@nestjs/common'
import { AuthService } from '../service/auth.service'
import { BattlesService } from '../service/battles.service'
import { CreateGuestDto } from '../dto/createGuest.dto'
import type { GuestAccount } from '../types/auth.types'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly battlesService: BattlesService,
  ) {}

  @Post('guest/:battleId')
  @HttpCode(200)
  createGuest(@Param('battleId') battleId: string, @Body() dto: CreateGuestDto): GuestAccount {
    const nickname = dto.nickname.trim()

    if (!nickname) {
      throw new BadRequestException('닉네임이 필요합니다.')
    }

    // 배틀 존재 확인
    const battleState = this.battlesService.getBattleState(battleId)
    if (!battleState) {
      throw new NotFoundException('배틀을 찾을 수 없습니다.')
    }

    // 배틀 방 내 닉네임 중복 체크
    if (this.battlesService.isNicknameDuplicate(battleId, nickname)) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.')
    }

    // Guest 생성
    const guest = this.authService.createGuest(nickname)

    // 배틀 방에 Guest 등록
    this.battlesService.registerGuest(battleId, guest)

    return guest
  }
}
