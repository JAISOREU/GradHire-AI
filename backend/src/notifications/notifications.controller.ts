import { Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationsService } from './notifications.service';
import { normalizePagination } from '../common/pagination';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me')
  async myNotifications(
    @Req() req: Request & { user: AuthUser },
    @Query('includeRead') includeRead?: string,
    @Query() query?: Record<string, unknown>,
  ) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.notifications.listForUser(req.user, includeRead === 'true', pagination);
  }

  @Put(':id/read')
  async markRead(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.notifications.markRead(req.user, id);
  }
}
