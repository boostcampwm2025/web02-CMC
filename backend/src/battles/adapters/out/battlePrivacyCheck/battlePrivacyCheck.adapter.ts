import { Injectable } from '@nestjs/common'
import { BattlePrivacyCheckPort } from 'src/battles/application/ports/out/battlePrivacyCheck.port'
import { PrismaService } from '../../../../prisma/prisma.service'

@Injectable()
export class BattlePrivacyCheckAdapter implements BattlePrivacyCheckPort {
  constructor(private readonly prisma: PrismaService) {}

  async isPrivateBattle(battleId: string): Promise<boolean> {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      select: { isPrivate: true },
    })
    return Boolean(battle?.isPrivate)
  }
}
