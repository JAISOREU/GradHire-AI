import { Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
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
    @Query('type') type?: string,
    @Query() query?: Record<string, unknown>,
  ) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.notifications.listForUser(req.user, includeRead === 'true', pagination, type);
  }

  @Put('me/read')
  async markAllRead(@Req() req: Request & { user: AuthUser }) {
    return this.notifications.markAllRead(req.user);
  }

  @Put(':id/read')
  async markRead(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.notifications.markRead(req.user, id);
  }

  @Put('admin/:id/read')
  @UseGuards(AdminGuard)
  async adminMarkRead(@Param('id') id: string) {
    return this.notifications.markReadAny(id);
  }
}
