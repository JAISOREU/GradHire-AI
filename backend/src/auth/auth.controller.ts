import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Query, BadRequestException } from '@nestjs/common';
import { AuthService, AuthUser } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';
import { RegisterDto } from '../common/dto/auth.dto';
import { LoginDto } from '../common/dto/auth.dto';
import { RefreshTokenDto } from '../common/dto/auth.dto';
import { ForgotPasswordDto } from '../common/dto/auth.dto';
import { ResetPasswordDto } from '../common/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
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
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(body.email);
  }

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
