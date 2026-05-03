import { Body, Controller, ForbiddenException, HttpCode, OnModuleInit, Param, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BattlePhaseTransitionUseCase } from '../../application/usecases/battlePhaseTransition.usecase'
import { DevForcePhaseDto } from '../../dto/devForcePhase.dto'

@Controller('dev/battles')
export class DevController implements OnModuleInit {
  constructor(
    private readonly phaseTransitionUseCase: BattlePhaseTransitionUseCase,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.assertNotProduction()
  }

  @Post(':id/phase')
  @HttpCode(200)
  async forcePhase(
    @Param('id') battleId: string,
    @Body() body: DevForcePhaseDto,
  ): Promise<{ battleId: string; phase: string; durationMs: number | null; round: number | null }> {
    this.assertNotProduction()
    await this.phaseTransitionUseCase.forcePhase(battleId, body.phase, body.durationMs, body.round)
    return { battleId, phase: body.phase, durationMs: body.durationMs ?? null, round: body.round ?? null }
  }

  private assertNotProduction(): void {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException('dev 엔드포인트는 production 환경에서 사용할 수 없습니다.')
    }
  }
}
