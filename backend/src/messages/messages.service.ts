import { Injectable, ForbiddenException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';
import { NotificationsGateway } from '../websockets/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private readonly MESSAGE_RATE_LIMIT = 20;
  private readonly MESSAGE_RATE_WINDOW_MS = 60_000;

  constructor(private readonly prisma: PrismaService, private readonly gateway: NotificationsGateway, private readonly notifications: NotificationsService) {}

  async listForUser(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; from: string; to: string; fromName?: string; toName?: string; body: string; createdAt: string; read: boolean }>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { OR: [{ senderId: user.id }, { recipientId: user.id }] as { senderId: string }[] };
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: { include: { profile: true, employerProfile: true } },
          recipient: { include: { profile: true, employerProfile: true } },
        },
      }) as Promise<
        Array<{
          id: string;
          senderId: string;
          recipientId: string;
          body: string;
          createdAt: Date;
          read: boolean;
          sender: {
            id: string;
            email: string;
            role: string;
            avatarUrl: string | null;
            profile?: { name: string; focus: string | null } | null;
            employerProfile?: { companyName: string; industry: string | null } | null;
          };
          recipient: {
            id: string;
            email: string;
            role: string;
            avatarUrl: string | null;
            profile?: { name: string; focus: string | null } | null;
            employerProfile?: { companyName: string; industry: string | null } | null;
          };
        }>
      >,
      this.prisma.message.count({ where }),
    ]);

    const nameFor = (u: {
      email: string;
      profile?: { name: string } | null;
      employerProfile?: { companyName: string } | null;
    }): string =>
      u.profile?.name ?? u.employerProfile?.companyName ?? u.email;

    const titleFor = (u: {
      profile?: { focus: string | null } | null;
      employerProfile?: { industry: string | null } | null;
    }): string | null =>
      u.profile?.focus ?? u.employerProfile?.industry ?? null;

    const companyFor = (u: {
      employerProfile?: { companyName: string } | null;
    }): string | null => u.employerProfile?.companyName ?? null;

    return applyPagination(
      messages.map((m) => ({
        id: m.id,
        from: m.senderId,
        to: m.recipientId,
        fromName: nameFor(m.sender),
        toName: nameFor(m.recipient),
        fromRole: m.sender.role,
        toRole: m.recipient.role,
        fromTitle: titleFor(m.sender),
        toTitle: titleFor(m.recipient),
        fromCompany: companyFor(m.sender),
        toCompany: companyFor(m.recipient),
        fromAvatar: m.sender.avatarUrl ?? null,
        toAvatar: m.recipient.avatarUrl ?? null,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        read: m.read,
      })),
      total,
      page,
      limit,
    );
  }

  async create(senderId: string, recipientId: string, body: string) {
    if (senderId === recipientId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }

    let recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      recipient = await this.prisma.user.findFirst({
        where: { email: { contains: recipientId, mode: 'insensitive' } },
        select: { id: true, role: true },
      });
    }

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (recipient.role === 'ADMIN') {
      throw new ForbiddenException('You cannot send messages to admins');
    }

    const recentCount = await this.prisma.message.count({
      where: {
        senderId,
        createdAt: { gte: new Date(Date.now() - this.MESSAGE_RATE_WINDOW_MS) },
      },
    });

    if (recentCount >= this.MESSAGE_RATE_LIMIT) {
      throw new BadRequestException('You are sending messages too quickly. Please wait a moment before sending another message.');
    }

    const message = await this.prisma.message.create({
      data: { senderId, recipientId: recipient.id, body, read: false },
    });

    const payload = {
      id: message.id,
      from: message.senderId,
      to: message.recipientId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      read: message.read,
    };

    this.gateway.server.to(`user:${recipient.id}`).emit('message', payload);
    this.gateway.server.to(`user:${senderId}`).emit('message', payload);

    await this.notifications.create(recipient.id, `New message: ${body.slice(0, 100)}`, undefined, 'MESSAGE');

    return payload;
  }

  async markRead(user: AuthUser, messageId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.recipientId !== user.id) {
      throw new ForbiddenException('You can only mark your own messages as read');
    }
    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });
    return {
      id: updated.id,
      from: updated.senderId,
      to: updated.recipientId,
      body: updated.body,
      createdAt: updated.createdAt.toISOString(),
      read: updated.read,
    };
  }
}
