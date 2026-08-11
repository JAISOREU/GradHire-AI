import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';
import { NotificationsGateway } from '../websockets/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly gateway: NotificationsGateway) {}

  async create(recipientId: string, message: string, applicationId?: string, type = 'GENERIC') {
    let notification;
    if (applicationId) {
      notification = await this.prisma.notification.upsert({
        where: { applicationId },
        update: { message, read: false, type },
        create: { recipientId, message, applicationId, read: false, type },
        include: {
          application: {
            include: {
              job: { select: { id: true, title: true, company: true } },
            },
          },
        },
      });
    } else {
      notification = await this.prisma.notification.create({
        data: { recipientId, message, applicationId: null, read: false, type },
        include: {
          application: {
            include: {
              job: { select: { id: true, title: true, company: true } },
            },
          },
        },
      });
    }

    const payload = {
      id: notification.id,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      job: notification.application?.job ?? null,
    };

    this.gateway.server.to(`user:${recipientId}`).emit('notification', payload);
    return payload;
  }

  async listForUser(user: AuthUser, includeRead = false, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where: Record<string, unknown> = {
      recipientId: user.id,
      ...(includeRead ? {} : { read: false }),
    };
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          application: {
            include: {
              job: { select: { id: true, title: true, company: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const items = notifications.map((n) => ({
      id: n.id,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      job: n.application?.job ?? null,
    }));
    return applyPagination(items, total, page, limit);
  }

  async markRead(user: AuthUser, notificationId: string): Promise<{ id: string; read: boolean }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.recipientId !== user.id) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }
    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return { id: updated.id, read: updated.read };
  }
}

