import { Controller, Get, Req, Res, UseGuards, HttpCode } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { OauthService } from '../service/oauth.service'
import { TokenService } from '../service/token.service'
import { OAuthProfile } from '../types/oauth.types'

@Controller('auth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @HttpCode(301)
  githubCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as OAuthProfile
    const { accessToken, refreshToken } = this.oauthService.loginWithGithub(profile)

    // 쿠키에 토큰 저장
    this.tokenService.setTokensInCookie(res, accessToken, refreshToken)

    // 프론트엔드로 리다이렉트
    res.redirect(this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173/')
  }
}
