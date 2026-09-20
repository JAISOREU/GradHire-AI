import { Injectable, Logger, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'node:crypto';
import { Response } from 'express';
import { PrismaService } from '../prisma.service';
import { AuthService, AuthUser } from '../auth/auth.service';
import { OAuthProvider, OAuthUserInfo } from './dto/oauth.dto';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../common/jwt.config';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const OAUTH_HTTP_TIMEOUT_MS = 10_000;

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  async generateState(redirect?: string): Promise<string> {
    const payload = {
      nonce: crypto.randomBytes(16).toString('hex'),
      redirect: redirect || '/',
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  validateState(state: string): { nonce: string; redirect: string } {
    try {
      const payload = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (payload.expiresAt < Date.now()) {
        throw new UnauthorizedException('OAuth state expired');
      }
      return { nonce: payload.nonce, redirect: payload.redirect };
    } catch {
      throw new UnauthorizedException('Invalid OAuth state');
    }
  }

  getAuthorizationUrl(provider: OAuthProvider, state: string): string {
    const config = this.getProviderConfig(provider);
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries({
          client_id: config.clientId,
          redirect_uri: config.callbackUrl,
          response_type: 'code',
          scope: config.scope,
          state,
          access_type: 'offline',
          prompt: 'consent',
        }).filter(([, value]) => value !== undefined),
      ) as Record<string, string>,
    );
    return `${config.authorizationUrl}?${params.toString()}`;
  }

  async handleCallback(provider: OAuthProvider, code: string, state: string, res?: Response): Promise<string> {
    this.validateState(state);

    const tokens = await this.exchangeCodeForTokens(provider, code);
    const userInfo = await this.fetchUserInfo(provider, tokens.accessToken);

    const user = await this.findOrCreateUser(userInfo);

    if (res) {
      await this.setAuthCookies(user, res);
    }

    return FRONTEND_URL + '/auth/callback?success=true';
  }

  private async exchangeCodeForTokens(provider: OAuthProvider, code: string): Promise<{ accessToken: string }> {
    const config = this.getProviderConfig(provider);
    const tokenUrl = config.tokenUrl;

    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.callbackUrl,
    };

    if (config.clientId) {
      params.client_id = config.clientId;
    }
    if (config.clientSecret) {
      params.client_secret = config.clientSecret;
    }

    const response = await axios.post(tokenUrl, new URLSearchParams(params), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      timeout: OAUTH_HTTP_TIMEOUT_MS,
    });

    if (response.data.error) {
      this.logger.error(`OAuth token error for ${provider}: ${response.data.error_description || response.data.error}`);
      throw new BadRequestException('OAuth authorization failed');
    }

    return {
      accessToken: response.data.access_token,
    };
  }

  private async fetchUserInfo(provider: OAuthProvider, accessToken: string): Promise<OAuthUserInfo> {
    switch (provider) {
      case 'google':
        return this.fetchGoogleUserInfo(accessToken);
      case 'github':
        return this.fetchGitHubUserInfo(accessToken);
      case 'linkedin':
        return this.fetchLinkedInUserInfo(accessToken);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  private async fetchGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: OAUTH_HTTP_TIMEOUT_MS,
    });

    return {
      provider: 'google',
      providerId: response.data.sub,
      email: response.data.email,
      emailVerified: response.data.email_verified === true,
      name: response.data.name,
      avatarUrl: response.data.picture,
    };
  }

  private async fetchGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const [userResponse, emailsResponse] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
        timeout: OAUTH_HTTP_TIMEOUT_MS,
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
        timeout: OAUTH_HTTP_TIMEOUT_MS,
      }),
    ]);

    const primaryEmail = emailsResponse.data.find((e: any) => e.primary && e.verified);
    const email = primaryEmail?.email;
    if (!email) {
      throw new BadRequestException('GitHub account does not have a verified email address');
    }

    return {
      provider: 'github',
      providerId: String(userResponse.data.id),
      email,
      emailVerified: true,
      name: userResponse.data.name || userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
    };
  }

  private async fetchLinkedInUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      timeout: OAUTH_HTTP_TIMEOUT_MS,
    });

    return {
      provider: 'linkedin',
      providerId: response.data.sub,
      email: response.data.email,
      emailVerified: response.data.email_verified === true,
      name: [response.data.given_name, response.data.family_name].filter(Boolean).join(' ') || undefined,
      avatarUrl: response.data.picture,
    };
  }

  private async findOrCreateUser(info: OAuthUserInfo) {
    const normalizedEmail = info.email.toLowerCase();

    const existingIdentity = await this.prisma.oAuthIdentity.findUnique({
      where: { provider_providerId: { provider: info.provider, providerId: info.providerId } },
      include: { user: { include: { profile: true, employerProfile: true } } },
    });

    if (existingIdentity) {
      await this.prisma.oAuthIdentity.update({
        where: { id: existingIdentity.id },
        data: {
          email: normalizedEmail,
          name: info.name,
          avatarUrl: info.avatarUrl,
          updatedAt: new Date(),
        },
      });
      return existingIdentity.user;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, passwordHash: { not: '' } },
    });

    if (existingUser) {
      if (info.emailVerified !== true) {
        throw new UnauthorizedException('OAuth email must be verified before linking');
      }
      await this.prisma.oAuthIdentity.create({
        data: {
          userId: existingUser.id,
          provider: info.provider,
          providerId: info.providerId,
          email: normalizedEmail,
          name: info.name,
          avatarUrl: info.avatarUrl,
        },
      });
      return existingUser;
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: crypto.randomBytes(32).toString('hex'),
        role: 'STUDENT',
        emailVerified: true,
        avatarUrl: info.avatarUrl,
        profile: {
          create: {
            name: info.name || normalizedEmail.split('@')[0],
            focus: '',
            summary: '',
            skills: [],
            authorizedCountries: [],
          },
        },
      },
      include: { profile: true, employerProfile: true },
    });

    await this.prisma.oAuthIdentity.create({
      data: {
        userId: user.id,
        provider: info.provider,
        providerId: info.providerId,
        email: normalizedEmail,
        name: info.name,
        avatarUrl: info.avatarUrl,
      },
    });

    return user;
  }

  private async setAuthCookies(user: any, res: Response): Promise<void> {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.employerProfile?.companyName,
      avatarUrl: user.avatarUrl ?? undefined,
      tokenVersion: user.tokenVersion,
    };

    const authResponse = this.auth['buildAuthResponse'](authUser);
    const refreshToken = await this.auth['createRefreshToken'](user.id);

    this.auth['setAuthCookie'](res, authResponse.accessToken);
    this.auth['setRefreshCookie'](res, refreshToken);
  }

  private getProviderConfig(provider: OAuthProvider) {
    switch (provider) {
      case 'google':
        return {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/oauth/google/callback`,
          scope: 'openid profile email',
        };
      case 'github':
        return {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/oauth/github/callback`,
          scope: 'user:email',
        };
      case 'linkedin':
        return {
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
          tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
          callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/oauth/linkedin/callback`,
          scope: 'openid profile email',
        };
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }
}
