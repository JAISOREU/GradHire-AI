import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('me')
  async getSettings(@Req() req: Request & { user: AuthUser }) {
    return this.settings.getForUser(req.user.id);
  }

  @Put('me')
  async updateSettings(@Req() req: Request & { user: AuthUser }, @Body() body: Record<string, unknown>) {
    return this.settings.upsertForUser(req.user.id, body);
  }
}
