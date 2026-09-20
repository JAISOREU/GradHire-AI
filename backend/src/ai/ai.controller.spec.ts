import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import { ServiceUnavailableException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AuthUser } from '../auth/auth.service';
import { Request } from 'express';

type ChatCall = { role: string; content: string }[] | undefined;

const makeController = (overrides: { onChat?: (messages: ChatCall) => Promise<string> } = {}) => {
  const ai = {
    isReady: () => true,
    chat: async (messages: ChatCall) => {
      if (overrides.onChat) return overrides.onChat(messages);
      return 'assistant reply';
    },
  } as any;
  const prisma = {
    profile: { findFirst: async () => null },
  } as any;
  const cache = {} as any;
  const controller = new AiController(ai, prisma, cache);
  return { controller, ai };
};

describe('AiController.careerChat', () => {
  let controller: AiController;
  let captured: ChatCall;

  beforeEach(() => {
    captured = undefined;
    const { controller: c, ai } = makeController({ onChat: (messages) => { captured = messages; return Promise.resolve('reply'); } });
    controller = c;
  });

  const req = () => ({ user: { id: 'student-001', role: 'STUDENT' } } as unknown as Request & { user: AuthUser });

  it('sends the current message to the AI as a user turn', async () => {
    await controller.careerChat(req(), { message: 'What AI careers are good for me?' });

    assert.ok(captured, 'expected chat() to receive messages');
    assert.equal(captured!.length, 1);
    assert.equal(captured![0].role, 'user');
    assert.equal(captured![0].content, 'What AI careers are good for me?');
  });

  it('prepends conversation history before the current message', async () => {
    await controller.careerChat(req(), {
      message: 'What now?',
      conversationHistory: [
        { role: 'user', content: 'Give me data careers' },
        { role: 'assistant', content: 'Here are some options.' },
      ],
    });

    assert.ok(captured, 'expected chat() to receive messages');
    assert.equal(captured!.length, 3);
    assert.deepStrictEqual(captured!.map((m) => m.role), ['user', 'assistant', 'user']);
    assert.equal(captured![2].content, 'What now?');
  });

  it('fails fast with 503 Service Unavailable when AI is not ready', async () => {
    const ai = { isReady: () => false, chat: async () => 'nope' } as any;
    const prisma = { profile: { findFirst: async () => null } } as any;
    const cache = {} as any;
    const notReady = new AiController(ai, prisma, cache);

    await assert.rejects(
      () => notReady.careerChat(req(), { message: 'hi' }),
      (err) => {
        assert.ok(err instanceof ServiceUnavailableException, `expected ServiceUnavailableException, got ${err?.constructor?.name}`);
        assert.equal((err as ServiceUnavailableException).getStatus(), 503);
        return true;
      },
    );
  });
});

describe('AiController.generateCandidateSummary', () => {
  const summaryResult = { summary: 'S', keyStrengths: [], potentialConcerns: [], recommendation: 'R', fitScore: 75 };

  const make = (candidate: Record<string, unknown> | null) => {
    const ai = {
      isReady: () => true,
      generateStructured: async () => summaryResult,
    } as any;
    const prisma = {
      profile: { findFirst: async () => null },
      user: { findUnique: async () => candidate },
    } as any;
    const cache = {} as any;
    return new AiController(ai, prisma, cache);
  };

  const req = () => ({ user: { id: 'emp-1', role: 'EMPLOYER' } } as unknown as Request & { user: AuthUser });

  it('rejects when the candidate has no application to this employer', async () => {
    const controller = make({
      id: 'cand-1',
      profile: { visibility: 'PUBLIC' },
      applications: [], // filtered to this employer's jobs — empty means no relationship
    });

    await assert.rejects(
      () => controller.generateCandidateSummary(req(), { candidateId: 'cand-1' }),
      (err) => {
        assert.ok(err instanceof NotFoundException, `expected NotFoundException, got ${err?.constructor?.name}`);
        return true;
      },
    );
  });

  it('rejects PRIVATE profiles even when an application exists', async () => {
    const controller = make({
      id: 'cand-1',
      profile: { visibility: 'PRIVATE' },
      applications: [{ id: 'app-1' }],
    });

    await assert.rejects(
      () => controller.generateCandidateSummary(req(), { candidateId: 'cand-1' }),
      (err) => {
        assert.ok(err instanceof ForbiddenException, `expected ForbiddenException, got ${err?.constructor?.name}`);
        return true;
      },
    );
  });

  it('returns a summary for an EMPLOYERS_ONLY candidate this employer actually hired toward', async () => {
    const controller = make({
      id: 'cand-1',
      profile: { visibility: 'EMPLOYERS_ONLY' },
      applications: [{ id: 'app-1' }],
    });

    const result = await controller.generateCandidateSummary(req(), { candidateId: 'cand-1' });
    assert.equal(result.summary, 'S');
  });

  it('returns 404 for a missing candidate', async () => {
    const controller = make(null);

    await assert.rejects(
      () => controller.generateCandidateSummary(req(), { candidateId: 'nope' }),
      NotFoundException,
    );
  });
});