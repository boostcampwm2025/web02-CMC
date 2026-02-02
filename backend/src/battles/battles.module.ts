import { Module } from '@nestjs/common'
import { BattlesController } from './controller/battles.controller'
import { AuthController } from './controller/auth.controller'
import { BattlesGateway } from './gateway/battles.gateway'
import { BattlesService } from './service/battles.service'
import { AuthService } from './service/auth.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { OauthModule } from '../oauth/oauth.module'
import { MetricsModule } from '../metrics/metrics.module'

// Core
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
import { BattleBroadcaster } from './infra/battle.broadcaster'
import { BattleUtil } from './infra/battle.util'

// Runtime
import { BattleTimerScheduler } from './runtime/battleTimerScheduler'

// Guest
import { GuestBuilder } from './guest/guest.builder'

@Module({
  imports: [OauthModule, MetricsModule],
  controllers: [BattlesController, AuthController],
  providers: [
    BattlesGateway,
    BattlesService,
    PrismaService,
    AuthService,
    // Core
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
    BattleBroadcaster,
    BattleUtil,
    // Runtime
    BattleTimerScheduler,
    // Guest
    GuestBuilder,
  ],
  exports: [BattlesService],
})
export class BattlesModule {}
