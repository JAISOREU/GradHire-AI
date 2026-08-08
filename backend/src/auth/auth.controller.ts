import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Query, BadRequestException } from '@nestjs/common';
import { AuthService, AuthUser } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string; role?: string }) {
    return this.auth.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() body: { token: string }) {
    return this.auth.refresh(body.token);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: AuthUser }) {
    return { user: req.user };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.auth.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    if (!body.token || !body.password) {
      throw new BadRequestException('Token and password are required');
    }
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
