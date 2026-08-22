import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AIProviderFactory } from './utils/provider.factory';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [AiController],
  providers: [
    AIProviderFactory,
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
