import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';
import { NotificationsGateway } from '../websockets/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService, private readonly gateway: NotificationsGateway, private readonly notifications: NotificationsService) {}

  async listForUser(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; from: string; to: string; body: string; createdAt: string; read: boolean }>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { OR: [{ senderId: user.id }, { recipientId: user.id }] as { senderId: string }[] };
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    return applyPagination(
      messages.map((m: { id: string; senderId: string; recipientId: string; body: string; createdAt: Date; read: boolean }) => ({
        id: m.id,
        from: m.senderId,
        to: m.recipientId,
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
    const message = await this.prisma.message.create({
      data: { senderId, recipientId, body, read: false },
    });

    const payload = {
      id: message.id,
      from: message.senderId,
      to: message.recipientId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      read: message.read,
    };

    this.gateway.server.to(`user:${recipientId}`).emit('message', payload);
    this.gateway.server.to(`user:${senderId}`).emit('message', payload);

    await this.notifications.create(recipientId, `New message: ${body.slice(0, 100)}`, undefined, 'MESSAGE');

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
