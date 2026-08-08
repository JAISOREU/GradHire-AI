import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsGatewayModule } from '../websockets/notifications.gateway.module';

@Module({
  imports: [AuthModule, NotificationsGatewayModule],
  controllers: [MessagesController],
  providers: [MessagesService, PrismaService],
  exports: [MessagesService],
})
export class MessagesModule {}
