import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [OAuthController],
  providers: [OAuthService],
  exports: [OAuthService, AuthModule],
})
export class OAuthModule {}
