import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });
    if (!settings) {
      return { userId, emailNotifications: true, applicationAlerts: true, defaultFocus: null };
    }
    return settings;
  }

  async upsertForUser(userId: string, payload: Record<string, unknown>) {
    const data: Record<string, unknown> = {};
    if (typeof payload.emailNotifications === 'boolean') data.emailNotifications = payload.emailNotifications;
    if (typeof payload.applicationAlerts === 'boolean') data.applicationAlerts = payload.applicationAlerts;
    if (typeof payload.recommendationAlerts === 'boolean') data.recommendationAlerts = payload.recommendationAlerts;
    if (typeof payload.messageAlerts === 'boolean') data.messageAlerts = payload.messageAlerts;
    if (typeof payload.interviewAlerts === 'boolean') data.interviewAlerts = payload.interviewAlerts;
    if (typeof payload.weeklyDigest === 'boolean') data.weeklyDigest = payload.weeklyDigest;
    if (typeof payload.defaultFocus === 'string') data.defaultFocus = payload.defaultFocus;

    return this.prisma.settings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
