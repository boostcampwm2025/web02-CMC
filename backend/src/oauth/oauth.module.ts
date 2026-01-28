import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { OauthController } from './controller/oauth.controller'
import { OauthService } from './service/oauth.service'
import { GithubStrategy } from './strategy/github.strategy'
import { KakaoStrategy } from './strategy/kakao.strategy'
import { TokenService } from './service/token.service'
import { JwtStrategy } from './strategy/jwt.strategy'
import { RefreshStrategy } from './strategy/jwt-refresh.strategy'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresIn = config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
        return {
          secret: config.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
          signOptions: {
            expiresIn,
          } as JwtModuleOptions['signOptions'],
        }
      },
    }),
  ],
  controllers: [OauthController],
  providers: [OauthService, GithubStrategy, KakaoStrategy, JwtStrategy, RefreshStrategy, TokenService, PrismaService],
  exports: [OauthService],
})
export class OauthModule {}
