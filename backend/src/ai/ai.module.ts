import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AIProviderFactory } from './utils/provider.factory';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AiController],
  providers: [
    AIProviderFactory,
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
