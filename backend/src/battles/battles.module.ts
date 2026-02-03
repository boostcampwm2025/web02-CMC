import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BattlesController } from './adapters/in/battles.controller'
import { GuestController } from './adapters/in/guests.controller'
import { BattlesGateway } from './adapters/in/battles.gateway'
import { BattlesService } from './service/battles.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { OauthModule } from '../oauth/oauth.module'
import { MetricsModule } from '../metrics/metrics.module'

// Domain Services
import { BattleResultService } from './domains/services/battleResult.service'
import { BattleTimelineService } from './domains/services/battleTimeline.service'
import { BattleMvpService } from './domains/services/battleMvp.service'
import { BattleTierService } from './domains/services/battleTier.service'
import { BattleDiscussionService } from './domains/services/battleDiscussion.service'
import { BattleVoteService } from './domains/services/battleVote.service'
import { BattlePhaseService } from './domains/services/battlePhase.service'
import { BattleTeamSwitchService } from './domains/services/battleTeamSwitch.service'
import { BattleChatService } from './domains/services/battleChat.service'
import { BattleSkipService } from './domains/services/battleSkip.service'
import { BattleGuestService } from './domains/services/battleGuest.service'
import { BattleQueryService } from './domains/services/battleQuery.service'

// UseCases
import { BattleCreationUseCase } from './application/usecases/battleCreation.usecase'
import { BattleParticipationUseCase } from './application/usecases/battleParticipation.usecase'
import { BattlePhaseTransitionUseCase } from './application/usecases/battlePhaseTransition.usecase'
import { BattleTerminationUseCase } from './application/usecases/battleTermination.usecase'
import { BattleInteractionUseCase } from './application/usecases/battleInteraction.usecase'
import { CreateGuestUseCase } from './application/usecases/createGuest.usecase'
import { GetOpenBattlesUseCase } from './application/usecases/getOpenBattles.usecase'
import { GetClosedBattlesUseCase } from './application/usecases/getClosedBattles.usecase'
import { GetBattleByInviteCodeUseCase } from './application/usecases/getBattleByInviteCode.usecase'
import { GetJoinBattleInfoUseCase } from './application/usecases/getJoinBattleInfo.usecase'
import { GetBattleResultUseCase } from './application/usecases/getBattleResult.usecase'
import { IsPrivateBattleUseCase } from './application/usecases/isPrivateBattle.usecase'

// Adapters (Out)
import { BattleRepositoryAdapter } from './adapters/out/persistence/battleRepository.adapter'
import { BattleStateRepositoryAdapter } from './adapters/out/state/battleStateRepository.adapter'
import { BattleBroadcasterAdapter } from './adapters/out/broadcaster/battleBroadcaster.adapter'
import { BattleTimerAdapter } from './adapters/out/timer/battleTimer.adapter'
import { BattleReferenceGeneratorAdapter } from './adapters/out/reference/battleReferenceGenerator.adapter'
import { BattleUtilAdapter } from './adapters/out/util/battleUtil.adapter'
import { GuestCheckAdapter } from './adapters/out/guestCheck/guestCheck.adapter'

// Port Tokens
import {
  BATTLE_REPO_PORT,
  BATTLE_STATE_PORT,
  BATTLE_BROADCASTER_PORT,
  BATTLE_TIMER_PORT,
  BATTLE_REFERENCE_PORT,
  BATTLE_UTIL_PORT,
  GUEST_CHECK_PORT,
} from './application/ports/tokens'

@Module({
  imports: [OauthModule, MetricsModule, ConfigModule],
  controllers: [BattlesController, GuestController],
  providers: [
    PrismaService,
    BattlesGateway,
    BattlesService,
    // Domain Services
    BattleResultService,
    BattleTimelineService,
    BattleMvpService,
    BattleTierService,
    BattleDiscussionService,
    BattleVoteService,
    BattlePhaseService,
    BattleTeamSwitchService,
    BattleChatService,
    BattleSkipService,
    BattleGuestService,
    BattleQueryService,
    // UseCases
    BattleCreationUseCase,
    BattleParticipationUseCase,
    BattlePhaseTransitionUseCase,
    BattleTerminationUseCase,
    BattleInteractionUseCase,
    CreateGuestUseCase,
    GetOpenBattlesUseCase,
    GetClosedBattlesUseCase,
    GetBattleByInviteCodeUseCase,
    GetJoinBattleInfoUseCase,
    GetBattleResultUseCase,
    IsPrivateBattleUseCase,
    // Adapters (Out)
    BattleRepositoryAdapter,
    BattleStateRepositoryAdapter,
    BattleBroadcasterAdapter,
    BattleTimerAdapter,
    BattleReferenceGeneratorAdapter,
    BattleUtilAdapter,
    GuestCheckAdapter,
    // Port Bindings
    {
      provide: BATTLE_REPO_PORT,
      useClass: BattleRepositoryAdapter,
    },
    {
      provide: BATTLE_STATE_PORT,
      useClass: BattleStateRepositoryAdapter,
    },
    {
      provide: BATTLE_BROADCASTER_PORT,
      useFactory: (gateway: BattlesGateway) => {
        return new BattleBroadcasterAdapter(gateway.server)
      },
      inject: [BattlesGateway],
    },
    {
      provide: BATTLE_TIMER_PORT,
      useClass: BattleTimerAdapter,
    },
    {
      provide: BATTLE_REFERENCE_PORT,
      useClass: BattleReferenceGeneratorAdapter,
    },
    {
      provide: BATTLE_UTIL_PORT,
      useClass: BattleUtilAdapter,
    },
    {
      provide: GUEST_CHECK_PORT,
      useClass: GuestCheckAdapter,
    },
  ],
  exports: [BattlesService],
})
export class BattlesModule {}
