import { Injectable, Logger, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Response } from 'express';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return 'gradture-dev-secret-change-me';
  }
  if (process.env.NODE_ENV === 'production' && secret === 'gradture-dev-secret-change-me') {
    throw new Error('JWT_SECRET must be changed in production');
  }
  return secret;
})();
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'];

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string;
  tokenVersion?: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  private getCookieOptions(): Record<string, unknown> {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie('access_token', token, this.getCookieOptions());
  }

  clearAuthCookie(res: Response): void {
    this.clearSessionCookie(res);
  }

  clearSessionCookie(res: Response): void {
    const options = this.getCookieOptions();
    res.clearCookie('access_token', {
      path: '/',
      secure: options.secure as boolean,
      sameSite: options.sameSite as 'none' | 'lax' | 'strict',
      httpOnly: options.httpOnly as boolean,
    });
  }

  async register(body: { email: string; password: string; name?: string; role?: string }, res?: Response): Promise<{ accessToken: string; user: AuthUser }> {
    const role = body.role === 'EMPLOYER' ? 'EMPLOYER' : 'STUDENT';
    if (body.role === 'ADMIN') {
      throw new ConflictException('This endpoint cannot register ADMIN users');
    }
    this.validatePasswordComplexity(body.password);
    const passwordHash = await bcrypt.hash(body.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash,
          role,
          profile: body.name
            ? {
                create: {
                  name: body.name,
                  focus: '',
                  summary: '',
                  skills: [],
                  authorizedCountries: [],
                },
              }
            : undefined,
        },
        include: { profile: true, employerProfile: true },
      });

      const authResponse = this.buildAuthResponse({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile?.name || user.employerProfile?.companyName,
        avatarUrl: user.avatarUrl ?? undefined,
      });

      if (res) {
        this.setAuthCookie(res, authResponse.accessToken);
      }

      return authResponse;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Unique constraint') || message.includes('unique')) {
        throw new ConflictException('An account with this email already exists');
      }
      this.logger.error('Registration failed', message);
      throw new ConflictException('Registration failed');
    }
  }

  async login(body: { email: string; password: string }, res?: Response): Promise<{ accessToken: string; user: AuthUser }> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true, email: true, role: true, passwordHash: true, avatarUrl: true, tokenVersion: true, profile: { select: { name: true } }, employerProfile: { select: { companyName: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });

    const authResponse = this.buildAuthResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.employerProfile?.companyName,
      avatarUrl: user.avatarUrl ?? undefined,
      tokenVersion: user.tokenVersion + 1,
    });

    if (res) {
      this.setAuthCookie(res, authResponse.accessToken);
    }

    return authResponse;
  }

  private buildAuthResponse(user: AuthUser): { accessToken: string; user: AuthUser } {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl, tokenVersion: user.tokenVersion };
    return {
      accessToken: this.jwt.sign(payload, { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }),
      user,
    };
  }

  async validateToken(token: string): Promise<AuthUser> {
    let payload: { sub: string; email: string; role: string; name?: string; avatarUrl?: string; tokenVersion: number };
    try {
      payload = this.jwt.verify(token, { secret: JWT_SECRET }) as { sub: string; email: string; role: string; name?: string; avatarUrl?: string; tokenVersion: number };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`JWT verification failed: ${message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, avatarUrl: true, tokenVersion: true, profile: { select: { name: true } }, employerProfile: { select: { companyName: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.employerProfile?.companyName || payload.name,
      avatarUrl: (user.avatarUrl || payload.avatarUrl) ?? undefined,
    };
  }

  async refresh(token: string, res?: Response): Promise<{ accessToken: string; user: AuthUser }> {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwt.verify(token, { secret: JWT_SECRET }) as { sub: string; email: string; role: string };
    } catch (err) {
      if (res) {
        this.clearSessionCookie(res);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, avatarUrl: true, profile: { select: { name: true } }, employerProfile: { select: { companyName: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const authResponse = this.buildAuthResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.employerProfile?.companyName,
      avatarUrl: user.avatarUrl ?? undefined,
    });

    if (res) {
      this.setAuthCookie(res, authResponse.accessToken);
    }

    return authResponse;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return { message: 'If an account exists, a reset email will be sent.' };
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    const tokenHash = await bcrypt.hash(token, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpires: expires, updatedAt: expires },
    });

    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
    await this.email.send({
      to: user.email,
      subject: 'Reset your password',
      text: `Click the following link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 1 hour.</p>`,
    });

    return { message: 'If an account exists, a reset email will be sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    this.validatePasswordComplexity(newPassword);

    const candidate = await this.prisma.user.findFirst({
      where: {
        resetTokenExpires: { gte: new Date() },
        resetTokenHash: { not: null },
      },
      select: { id: true, resetTokenHash: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!candidate?.resetTokenHash || !bcrypt.compareSync(token, candidate.resetTokenHash)) {
      await this.prisma.user.updateMany({
        where: { resetTokenExpires: { gte: new Date() }, resetTokenHash: { not: null } },
        data: { resetTokenHash: null, resetTokenExpires: null },
      });
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: candidate.id },
      data: { passwordHash, resetTokenHash: null, resetTokenExpires: null },
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const candidates = await this.prisma.user.findMany({
      where: {
        emailVerified: false,
        emailVerificationToken: { not: null },
        emailVerificationExpires: { gte: new Date() },
      },
      select: { id: true, emailVerificationToken: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    let matchedUser = null;
    for (const user of candidates) {
      if (user.emailVerificationToken && await bcrypt.compare(token, user.emailVerificationToken)) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
    });

    return { message: 'Email verified successfully' };
  }

  async sendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const tokenHash = await bcrypt.hash(token, 12);
    const verifyUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/verify-email?token=${token}`;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: tokenHash, emailVerificationExpires: expires },
    });

    await this.email.send({
      to: user.email,
      subject: 'Verify your email',
      text: `Click the following link to verify your email: ${verifyUrl}`,
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    return { message: 'Verification email sent' };
  }

  private validatePasswordComplexity(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }
}

