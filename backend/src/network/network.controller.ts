import { Controller, Get, Post, Delete, Param, Query, Req, UseGuards, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NetworkService } from './network.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { Request } from 'express';

@Controller('network')
@UseGuards(AuthGuard)
export class NetworkController {
  constructor(private readonly network: NetworkService) {}

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get('suggested')
  suggested(@Req() req: Request & { user: AuthUser }, @Query('limit') limit?: string) {
    return this.network.suggested(req.user.id, limit ? Number(limit) : 12);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get('search')
  search(@Req() req: Request & { user: AuthUser }, @Query('q') q?: string, @Query('limit') limit?: string) {
    return this.network.search(req.user.id, (q ?? '').trim(), limit ? Number(limit) : 20);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get('connections')
  connections(@Req() req: Request & { user: AuthUser }) {
    return this.network.connections(req.user.id);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get('requests')
  requests(@Req() req: Request & { user: AuthUser }) {
    return this.network.requests(req.user.id);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get('following')
  following(@Req() req: Request & { user: AuthUser }) {
    return this.network.following(req.user.id);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get('sidebar')
  sidebar(@Req() req: Request & { user: AuthUser }) {
    return this.network.sidebar(req.user.id);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Post('connect/:userId')
  connect(@Req() req: Request & { user: AuthUser }, @Param('userId') targetId: string) {
    return this.network.connect(req.user.id, targetId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Delete('connect/:userId')
  removeConnection(@Req() req: Request & { user: AuthUser }, @Param('userId') targetId: string) {
    return this.network.removeConnection(req.user.id, targetId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Post('requests/:connectionId/accept')
  accept(@Req() req: Request & { user: AuthUser }, @Param('connectionId') connectionId: string) {
    return this.network.accept(req.user.id, connectionId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Delete('requests/:connectionId')
  decline(@Req() req: Request & { user: AuthUser }, @Param('connectionId') connectionId: string) {
    return this.network.decline(req.user.id, connectionId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Post('follow/:userId')
  follow(@Req() req: Request & { user: AuthUser }, @Param('userId') targetId: string) {
    return this.network.follow(req.user.id, targetId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Delete('follow/:userId')
  unfollow(@Req() req: Request & { user: AuthUser }, @Param('userId') targetId: string) {
    return this.network.unfollow(req.user.id, targetId);
  }
}