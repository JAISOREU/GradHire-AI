import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { NotificationsGatewayModule } from '../websockets/notifications.gateway.module';

@Module({
  imports: [NotificationsGatewayModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
