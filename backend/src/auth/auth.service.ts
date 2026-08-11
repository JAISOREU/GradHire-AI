import { Injectable, Logger, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
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
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  async register(body: { email: string; password: string; name?: string; role?: string }): Promise<{ accessToken: string; user: AuthUser }> {
    const role = body.role === 'EMPLOYER' ? 'EMPLOYER' : 'STUDENT';
    if (body.role === 'ADMIN') {
      throw new ConflictException('This endpoint cannot register ADMIN users');
    }
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

      return this.buildAuthResponse({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile?.name || user.employerProfile?.companyName,
        avatarUrl: user.avatarUrl ?? undefined,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Unique constraint') || message.includes('unique')) {
        throw new ConflictException('An account with this email already exists');
      }
      this.logger.error('Registration failed', message);
      throw new ConflictException('Registration failed');
    }
  }

  async login(body: { email: string; password: string }): Promise<{ accessToken: string; user: AuthUser }> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true, email: true, role: true, passwordHash: true, avatarUrl: true, profile: { select: { name: true } }, employerProfile: { select: { companyName: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.employerProfile?.companyName,
      avatarUrl: user.avatarUrl ?? undefined,
    });
  }

  private buildAuthResponse(user: AuthUser): { accessToken: string; user: AuthUser } {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl };
    return {
      accessToken: this.jwt.sign(payload, { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN }),
      user,
    };
  }

  async validateToken(token: string): Promise<AuthUser> {
    try {
      const payload = this.jwt.verify(token, { secret: JWT_SECRET }) as { sub: string; email: string; role: string; name?: string; avatarUrl?: string };
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, avatarUrl: true, profile: { select: { name: true } }, employerProfile: { select: { companyName: true } } },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile?.name || user.employerProfile?.companyName || payload.name,
        avatarUrl: (user.avatarUrl || payload.avatarUrl) ?? undefined,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refresh(token: string): Promise<{ accessToken: string; user: AuthUser }> {
    const payload = this.jwt.verify(token, { secret: JWT_SECRET }) as { sub: string; email: string; role: string };

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

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.employerProfile?.companyName,
      avatarUrl: user.avatarUrl ?? undefined,
    });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return { message: 'If an account exists, a reset email will be sent.' };
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
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
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerified: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
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
    const verifyUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/verify-email?token=${token}`;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: token },
    });

    await this.email.send({
      to: user.email,
      subject: 'Verify your email',
      text: `Click the following link to verify your email: ${verifyUrl}`,
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    return { message: 'Verification email sent' };
  }
}

