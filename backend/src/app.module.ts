import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthService } from './health/health.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { PrismaModule } from './prisma.module';
import { CacheModule } from './cache/cache.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ResumesModule } from './resumes/resumes.module';
import { EmployerModule } from './employer/employer.module';
import { SettingsModule } from './settings/settings.module';
import { CompaniesModule } from './companies/companies.module';
import { AdminModule } from './admin/admin.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { NotificationsGatewayModule } from './websockets/notifications.gateway.module';
import { MessagesModule } from './messages/messages.module';
import { ScreeningModule } from './screening/screening.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { JobAggregationModule } from './job-aggregation/job-aggregation.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    PrismaModule,
    CacheModule,
    AiModule,
    AuthModule,
    ApplicationsModule,
    NotificationsModule,
    ResumesModule,
    EmployerModule,
    SettingsModule,
    CompaniesModule,
    AdminModule,
    RateLimitModule,
    StorageModule,
    EmailModule,
    NotificationsGatewayModule,
    MessagesModule,
    ScreeningModule,
    InterviewsModule,
    AnalyticsModule,
    UsersModule,
    JobAggregationModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [
    AppService,
    HealthService,
    MetricsService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
