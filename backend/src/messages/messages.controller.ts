import { Controller, Get, Param, Post, Put, Query, Req, UseGuards, Body, ForbiddenException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { MessagesService } from './messages.service';
import { normalizePagination } from '../common/pagination';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get('me')
  async myMessages(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.messages.listForUser(req.user, pagination);
  }

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post()
  async send(@Req() req: Request & { user: AuthUser }, @Body() payload: { to: string; body: string }) {
    if (req.user.role === 'ADMIN') {
      throw new ForbiddenException('Admins cannot send messages');
    }
    return this.messages.create(req.user.id, payload.to, payload.body);
  }

  @Put(':id/read')
  async markRead(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.messages.markRead(req.user, id);
  }
}
