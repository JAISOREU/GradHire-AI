import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AIProviderFactory } from './utils/provider.factory';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { GroqProvider } from './providers/groq.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AiController],
  providers: [
    AIProviderFactory,
    AiService,
    GeminiProvider,
    OpenAIProvider,
    GroqProvider,
    OllamaProvider,
  ],
  exports: [AiService],
})
export class AiModule {}
