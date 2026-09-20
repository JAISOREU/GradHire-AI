import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert/strict';
import { AiService } from './ai.service';

class FakeProvider {
  readonly name = 'fake';
  readonly supportedModels = ['fake-model'];

  constructor(private behavior: { text?: string; structured?: any; chat?: string; health?: boolean; embed?: number[]; tokens?: number }) {}

  async generateText(request: any): Promise<any> {
    return { text: this.behavior.text || 'ok', provider: this.name, model: 'fake-model' };
  }

  async generateStructured<T>(request: any, schema: any): Promise<{ data: T; response: any }> {
    return { data: (this.behavior.structured || {}) as T, response: await this.generateText(request) };
  }

  async chat(request: any): Promise<any> {
    return { text: this.behavior.chat || 'ok', message: { role: 'assistant', content: this.behavior.chat || 'ok' }, provider: this.name, model: 'fake-model' };
  }

  async embed(request: any): Promise<any> {
    return { embedding: this.behavior.embed || [], dimensions: 0, provider: this.name, model: 'fake-model' };
  }

  async countTokens(text: string): Promise<number> {
    return this.behavior.tokens || text.length;
  }

  async healthCheck(): Promise<boolean> {
    return this.behavior.health ?? true;
  }
}

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    service = new AiService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('is not ready before initialization', () => {
    assert.strictEqual(service.isReady(), false);
  });

  it('returns provider name none when not initialized', () => {
    assert.strictEqual(service.getProviderName(), 'none');
  });

  it('throws when getting provider before init', () => {
    assert.throws(() => service.getProvider(), /AI provider not initialized/);
  });

  it('throws when generating text before init', async () => {
    await assert.rejects(() => service.generateText('hello'), /AI service not available/);
  });

  it('throws when generating structured before init', async () => {
    await assert.rejects(() => service.generateStructured({ prompt: 'hello' }, {}), /AI service not available/);
  });

  it('throws when chatting before init', async () => {
    await assert.rejects(() => service.chat([{ role: 'user', content: 'hi', timestamp: new Date() }]), /AI service not available/);
  });

  it('returns empty recommendations before init', async () => {
    const result = await service.getRecommendations('tech');
    assert.deepStrictEqual(result, []);
  });

  it('returns empty recommendations on failure', async () => {
    // Without env config, initialization will fail but service should handle gracefully
    const result = await service.getRecommendations('tech');
    assert.deepStrictEqual(result, []);
  });

  describe('healthCheck fallback awareness', () => {
    const setProviders = (s: AiService, primary: FakeProvider, fallback?: FakeProvider) => {
      (s as any).provider = primary;
      if (fallback) (s as any).fallbackProvider = fallback;
      (s as any).ready = true;
    };

    it('returns true when primary provider is healthy (no fallback)', async () => {
      setProviders(service, new FakeProvider({ health: true }));
      assert.strictEqual(await service.healthCheck(), true);
    });

    it('returns false when primary is down and no fallback is configured', async () => {
      setProviders(service, new FakeProvider({ health: false }));
      assert.strictEqual(await service.healthCheck(), false);
    });

    it('returns true when primary is down but fallback is healthy', async () => {
      setProviders(
        service,
        new FakeProvider({ health: false }),
        new FakeProvider({ health: true }),
      );
      assert.strictEqual(await service.healthCheck(), true);
    });

    it('returns false when both primary and fallback are down', async () => {
      setProviders(
        service,
        new FakeProvider({ health: false }),
        new FakeProvider({ health: false }),
      );
      assert.strictEqual(await service.healthCheck(), false);
    });
  });
});
