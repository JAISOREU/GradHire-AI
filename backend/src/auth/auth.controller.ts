import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Query, BadRequestException, Res, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Request } from 'express';
import { AuthService, AuthUser } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RegisterDto } from '../common/dto/auth.dto';
import { LoginDto } from '../common/dto/auth.dto';
import { ForgotPasswordDto } from '../common/dto/auth.dto';
import { ResetPasswordDto } from '../common/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res?: Response) {
    return this.auth.register(body, res);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res?: Response) {
    return this.auth.login(body, res);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request & { cookies?: Record<string, string> }, @Res({ passthrough: true }) res?: Response) {
    const token = req.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    return this.auth.refresh(token, res);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res?: Response) {
    if (res) {
      this.auth.clearAuthCookie(res);
    }
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: AuthUser }) {
    return { user: req.user };
  }

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(body.email);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard)
  @Post('send-verification')
  async sendVerification(@Req() req: Request & { user: AuthUser }) {
    return this.auth.sendVerificationEmail(req.user.id);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.auth.verifyEmail(token);
  }
}
