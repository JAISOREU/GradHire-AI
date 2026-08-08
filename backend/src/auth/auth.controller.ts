import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Query, BadRequestException } from '@nestjs/common';
import { AuthService, AuthUser } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';
import { RegisterDto } from '../common/dto/auth.dto';
import { LoginDto } from '../common/dto/auth.dto';
import { RefreshTokenDto } from '../common/dto/auth.dto';
import { ForgotPasswordDto } from '../common/dto/auth.dto';
import { ResetPasswordDto } from '../common/dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.token);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async me(@Req() req: Request & { user: AuthUser }) {
    return { user: req.user };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard)
  @Post('send-verification')
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerification(@Req() req: Request & { user: AuthUser }) {
    return this.auth.sendVerificationEmail(req.user.id);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.auth.verifyEmail(token);
  }
}
