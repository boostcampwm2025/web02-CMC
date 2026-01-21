import { Controller, Get, Post, Patch, Req, Res, UseGuards, HttpCode, Body } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import * as express from 'express'
import { OauthService } from '../service/oauth.service'
import { TokenService } from '../service/token.service'
import type { OAuthProfile } from '../types/oauth.types'
import { JwtAuthGuard } from '../guard/jwt-auth.guard'
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
  githubCallback(@Req() req: express.Request, @Res() res: express.Response) {
    const profile = req.user as OAuthProfile
    const { accessToken, refreshToken } = this.oauthService.loginWithGithub(profile)

    // 쿠키에 토큰 저장
    this.tokenService.setTokensInCookie(res, accessToken, refreshToken)

    // 프론트엔드로 리다이렉트
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173/'
    res.redirect(`${frontendUrl}/auth/callback`)
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {}

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @HttpCode(301)
  kakaoCallback(@Req() req: express.Request, @Res() res: express.Response) {
    const profile = req.user as OAuthProfile
    const { accessToken, refreshToken } = this.oauthService.loginWithKakao(profile)

    this.tokenService.setTokensInCookie(res, accessToken, refreshToken)

    // 프론트엔드로 리다이렉트
    res.redirect(this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173/')
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(200)
  refresh(@Req() req: express.Request, @Res() res: express.Response) {
    const user = req.user as { userId: string; refreshToken: string }
    const { accessToken, refreshToken: newRefreshToken } = this.oauthService.refreshToken(user.refreshToken)
    // 새로운 토큰을 쿠키에 설정
    this.tokenService.setTokensInCookie(res, accessToken, newRefreshToken)
    return res.json({ success: true })
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  logout(@Req() req: express.Request, @Res() res: express.Response): void {
    const refreshToken = req.cookies?.refresh_token as string | undefined

    // refreshToken이 있으면 무효화
    if (refreshToken) {
      this.tokenService.revokeRefreshToken(refreshToken)
    }

    this.tokenService.clearAuthCookies(res)
    res.json({ success: true })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: express.Request) {
    const jwtUser = req.user as { id: string }
    return this.oauthService.findUserById(jwtUser.id)
  }

  @Patch('nickname')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  updateNickname(@Req() req: express.Request, @Body() dto: UpdateNicknameDto): OAuthUserResponseDto {
    const jwtUser = req.user as { id: string }
    return this.oauthService.updateUserNickname(jwtUser.id, dto.nickname)
  }
}
