import { Module } from '@nestjs/common'
import { BattlesController } from './controller/battles.controller'
import { GuestController } from './controller/guests.controller'
import { BattlesGateway } from './gateway/battles.gateway'
import { BattlesService } from './service/battles.service'
import { GuestService } from './service/guest.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { OauthModule } from '../oauth/oauth.module'
import { MetricsModule } from '../metrics/metrics.module'

// Core
import { BattleResultBuilder } from './core/battleResult'
import { BattleTimelineBuilder } from './core/battleTimeline'
import { BattleMvpCalculator } from './core/battleMvp'
import { BattleTierCalculator } from './core/battleTier'
import { BattleDiscussionHandler } from './core/battleDiscussion'
import { BattleDiscussionPolicy } from './core/battleDiscussionPolicy'
import { BattleVoteHandler } from './core/battleVote'
import { BattlePhaseHandler } from './core/battlePhase'
import { BattleTeamSwitchHandler } from './core/battleTeamSwitch'
import { BattleChatHandler } from './core/battleChat'
import { BattleSkipHandler } from './core/battleSkip'

// Infra
import { BattleRepository } from './infra/battle.repository'
import { BattleStateRepository } from './infra/battleState.repository'
import { BattleBroadcaster } from './infra/battle.broadcaster'
import { BattleUtil } from './infra/battle.util'
import { BattleReferenceGenerator } from './infra/battleReference'

// Runtime
import { BattleTimerScheduler } from './runtime/battleTimerScheduler'

// Guest
import { GuestBuilder } from './guest/guest.builder'

@Module({
  imports: [OauthModule, MetricsModule],
  controllers: [BattlesController, GuestController],
  providers: [
    BattlesGateway,
    BattlesService,
    PrismaService,
    GuestService,
    // Core
    BattleResultBuilder,
    BattleTimelineBuilder,
    BattleMvpCalculator,
    BattleTierCalculator,
    BattleDiscussionHandler,
    BattleDiscussionPolicy,
    BattleVoteHandler,
    BattlePhaseHandler,
    BattleTeamSwitchHandler,
    BattleChatHandler,
    BattleSkipHandler,
    // Infra
    BattleRepository,
    BattleStateRepository,
    BattleBroadcaster,
    BattleUtil,
    BattleReferenceGenerator,
    // Runtime
    BattleTimerScheduler,
    // Guest
    GuestBuilder,
  ],
  exports: [BattlesService],
})
export class BattlesModule {}
