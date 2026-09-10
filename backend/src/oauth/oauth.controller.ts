import { Controller, Get, Query, Res, UseGuards, BadRequestException, UnauthorizedException, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { OAuthService } from './oauth.service';
import { OAuthProvider } from './dto/oauth.dto';

@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauth: OAuthService) {}

  @Get(':provider')
  async initiate(
    @Query('redirect') redirect?: string,
    @Req() req?: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res?: Response,
  ) {
    const provider = req?.params?.provider as OAuthProvider;
    if (!provider) {
      throw new BadRequestException('Provider is required');
    }
    const state = await this.oauth.generateState(redirect);
    const url = await this.oauth.getAuthorizationUrl(provider, state);
    res?.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 5 * 60 * 1000,
      path: '/',
    });
    return { url };
  }

  @Get(':provider/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res?: Response,
  ) {
    const provider = req.params.provider as OAuthProvider;
    if (!provider || !code || !state) {
      throw new BadRequestException('Missing required parameters');
    }

    const storedState = req.cookies?.oauth_state;
    if (!storedState || storedState !== state) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }

    res?.clearCookie('oauth_state', { path: '/' });

    const redirectTo = await this.oauth.handleCallback(provider, code, state, res);

    return res ? res.redirect(redirectTo) : { redirectTo };
  }
}
