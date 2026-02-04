import { Controller, Get, Post, Patch, Req, Res, UseGuards, HttpCode, Body } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import type { Request as expressReq, Response as expressRes } from 'express'
import { OauthService } from '../service/oauth.service'
import { TokenService } from '../service/token.service'
import type { OAuthProfile } from '../types/oauth.types'
import { JwtAuthGuard } from '../guard/jwt-auth.guard'
import { RefreshGuard } from '../strategy/jwt-refresh.strategy'
import { UpdateNicknameDto } from '../dto/updateNickname.dto'
import { OAuthUserResponseDto } from '../dto/oauthUserResponse.dto'

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
  @HttpCode(302)
  async githubCallback(@Req() req: expressReq, @Res() res: expressRes) {
    const profile = req.user as OAuthProfile
    const { accessToken, sessionId } = await this.oauthService.loginWithGithub(profile)

    this.tokenService.setTokensInCookie(res, accessToken, sessionId)

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/main`)
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {}

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @HttpCode(302)
  async kakaoCallback(@Req() req: expressReq, @Res() res: expressRes) {
    const profile = req.user as OAuthProfile
    const { accessToken, sessionId } = await this.oauthService.loginWithKakao(profile)

    this.tokenService.setTokensInCookie(res, accessToken, sessionId)

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/main`)
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(200)
  async refresh(@Req() req: expressReq, @Res() res: expressRes) {
    const user = req.user as { userId: string; sessionId: string }
    const { accessToken, sessionId: newSessionId } = await this.oauthService.refreshToken(user.sessionId)
    this.tokenService.setTokensInCookie(res, accessToken, newSessionId)
    return res.json({ success: true })
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() req: expressReq, @Res() res: expressRes): Promise<void> {
    const sessionId = req.cookies?.session_id as string | undefined

    if (sessionId) {
      await this.tokenService.revokeRefreshToken(sessionId)
    }

    this.tokenService.clearAuthCookies(res)
    res.json({ success: true })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: expressReq) {
    const jwtUser = req.user as { id: string }
    return await this.oauthService.findUserById(jwtUser.id)
  }

  @Patch('nickname')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateNickname(@Req() req: expressReq, @Body() dto: UpdateNicknameDto): Promise<OAuthUserResponseDto> {
    const jwtUser = req.user as { id: string }
    return await this.oauthService.updateUserNickname(jwtUser.id, dto.nickname)
  }
}
