import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, BadRequestException } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from '../prisma.service';
import { JWT_SECRET } from '../common/jwt.config';

@WebSocketGateway({
  cors: {
    origin: (() => {
      const raw = process.env.CORS_ORIGIN;
      if (!raw) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('CORS_ORIGIN environment variable is required in production');
        }
        return ['http://localhost:5173', 'http://localhost:3000'];
      }
      return raw.split(',').map((o) => o.trim()).filter(Boolean);
    })(),
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  private extractTokenFromHandshake(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
      return authToken;
    }

    const cookieHeader = client.handshake.headers?.cookie;
    if (cookieHeader && typeof cookieHeader === 'string') {
      const match = cookieHeader.match(/access_token=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  async handleConnection(client: Socket) {
    await Sentry.withIsolationScope(async () => {
      try {
        const token = this.extractTokenFromHandshake(client);
        if (!token) {
          this.logger.warn(`Socket ${client.id} rejected: no token`);
          client.disconnect();
          return;
        }

        let payload: { sub: string; email: string; role: string; tokenVersion: number };
        try {
          payload = this.jwt.verify(token, { secret: JWT_SECRET }) as { sub: string; email: string; role: string; tokenVersion: number };
        } catch {
          this.logger.warn(`Socket ${client.id} rejected: invalid token`);
          client.disconnect();
          return;
        }

        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, tokenVersion: true, role: true },
        });

        if (!user || payload.tokenVersion !== user.tokenVersion) {
          this.logger.warn(`Socket ${client.id} rejected: token revoked or user not found`);
          client.disconnect();
          return;
        }

        client.data.userId = user.id;
        client.join(`user:${user.id}`);
        this.logger.debug(`Socket ${client.id} connected for user ${user.id}`);
      } catch (error) {
        this.logger.error(`Socket ${client.id} connection error`, error);
        client.disconnect();
      }
    });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    this.logger.debug(`Socket ${client.id} disconnected for user ${userId}`);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (data.userId !== client.data.userId) {
      throw new BadRequestException("Cannot join another user's room");
    }
    client.join(`user:${data.userId}`);
    this.logger.debug(`Socket ${client.id} joined room user:${data.userId}`);
    return { ok: true };
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (data.userId !== client.data.userId) {
      throw new BadRequestException("Cannot leave another user's room");
    }
    client.leave(`user:${data.userId}`);
    this.logger.debug(`Socket ${client.id} left room user:${data.userId}`);
    return { ok: true };
  }

  getServer(): Server | undefined {
    return this.server;
  }
}
