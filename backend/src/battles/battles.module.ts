import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BattlesController } from './adapters/in/battles.controller'
import { GuestController } from './adapters/in/guests.controller'
import { BattlesGateway } from './adapters/in/battles.gateway'
import { PrismaService } from 'src/prisma/prisma.service'
import { OauthModule } from '../oauth/oauth.module'
import { MetricsModule } from '../metrics/metrics.module'
import { InviteAccessGuard } from './guards/inviteAccess.guard'

// Domain Services
import { BattleResultService } from './domains/services/battleResult/battleResult.service'
import { BattleTimelineService } from './domains/services/battleTimeline/battleTimeline.service'
import { BattleMvpService } from './domains/services/battleMvp/battleMvp.service'
import { BattleTierService } from './domains/services/battleTier/battleTier.service'
import { BattleDiscussionService } from './domains/services/battleDiscussion/battleDiscussion.service'
import { BattleVoteService } from './domains/services/battleVote/battleVote.service'
import { BattlePhaseService } from './domains/services/battlePhase/battlePhase.service'
import { BattleTeamSwitchService } from './domains/services/battleTeamSwitch/battleTeamSwitch.service'
import { BattleChatService } from './domains/services/battleChat/battleChat.service'
import { BattleSkipService } from './domains/services/battleSkip/battleSkip.service'
import { BattleGuestService } from './domains/services/battleGuest/battleGuest.service'
import { BattleQueryService } from './domains/services/battleQuery/battleQuery.service'

// UseCases
import { BattleCreationUseCase } from './application/usecases/battleCreation.usecase'
import { BattleParticipationUseCase } from './application/usecases/battleParticipation.usecase'
import { BattlePhaseTransitionUseCase } from './application/usecases/battlePhaseTransition.usecase'
import { BattleTerminationUseCase } from './application/usecases/battleTermination.usecase'
import { BattleInteractionUseCase } from './application/usecases/battleInteraction.usecase'
import { CreateGuestUseCase } from './application/usecases/createGuest.usecase'
import { BattleQueryUseCase } from './application/usecases/battleQuery.usecase'

// Adapters (Out)
import { BattleRepositoryAdapter } from './adapters/out/persistence/battleRepository.adapter'
import { BattleStateRepositoryAdapter } from './adapters/out/state/battleStateRepository.adapter'
import { BattleBroadcasterAdapter } from './adapters/out/broadcaster/battleBroadcaster.adapter'
import { BattleTimerAdapter } from './adapters/out/timer/battleTimer.adapter'
import { BattleReferenceGeneratorAdapter } from './adapters/out/reference/battleReferenceGenerator.adapter'
import { BattleIdentifierAdapter } from './adapters/out/battleIdentifier/battleIdentifier.adapter'
import { GuestCheckAdapter } from './adapters/out/guestCheck/guestCheck.adapter'
import { BattlePrivacyCheckAdapter } from './adapters/out/battlePrivacyCheck/battlePrivacyCheck.adapter'

// Port Tokens
import {
  BATTLE_REPO_PORT,
  BATTLE_STATE_PORT,
  BATTLE_BROADCASTER_PORT,
  BATTLE_TIMER_PORT,
  BATTLE_REFERENCE_PORT,
  BATTLE_IDENTIFIER_PORT,
  GUEST_CHECK_PORT,
  BATTLE_PRIVACY_CHECK_PORT,
} from './application/ports/tokens'

@Module({
  imports: [OauthModule, MetricsModule, ConfigModule],
  controllers: [BattlesController, GuestController],
  providers: [
    PrismaService,
    BattlesGateway,
    InviteAccessGuard,

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
    BattleQueryUseCase,

    // Adapters (Out)
    BattleRepositoryAdapter,
    BattleStateRepositoryAdapter,
    BattleTimerAdapter,
    BattleReferenceGeneratorAdapter,
    BattleIdentifierAdapter,
    GuestCheckAdapter,
    BattlePrivacyCheckAdapter,

    BattleBroadcasterAdapter,

    { provide: BATTLE_REPO_PORT, useClass: BattleRepositoryAdapter },
    { provide: BATTLE_STATE_PORT, useClass: BattleStateRepositoryAdapter },
    { provide: BATTLE_BROADCASTER_PORT, useExisting: BattleBroadcasterAdapter },
    { provide: BATTLE_TIMER_PORT, useClass: BattleTimerAdapter },
    { provide: BATTLE_REFERENCE_PORT, useClass: BattleReferenceGeneratorAdapter },
    { provide: BATTLE_IDENTIFIER_PORT, useClass: BattleIdentifierAdapter },
    { provide: GUEST_CHECK_PORT, useClass: GuestCheckAdapter },
    { provide: BATTLE_PRIVACY_CHECK_PORT, useClass: BattlePrivacyCheckAdapter },
  ],
})
export class BattlesModule {}
