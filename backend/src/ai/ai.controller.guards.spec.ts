import 'reflect-metadata';
import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { AiController } from './ai.controller';
import { AuthGuard } from '../auth/auth.guard';
import { StudentGuard } from '../auth/student.guard';
import { EmployerGuard } from '../auth/employer.guard';

describe('AiController guards', () => {
  const metadataKey = '__guards__';
  const prototype = AiController.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;

  it('every StudentGuard route also authenticates first via AuthGuard', () => {
    const protectedMethods = ['parseResume', 'analyzeResume', 'improveResume', 'extractSkills', 'matchJob', 'matchJobById', 'generateCoverLetter', 'skillGapAnalysis', 'generateCareerRecommendations', 'getRecommendations'];

    for (const method of protectedMethods) {
      const guards: unknown[] = Reflect.getMetadata(metadataKey, prototype[method]) ?? [];
      assert.ok(guards.includes(AuthGuard), `${method} must run AuthGuard before StudentGuard`);
      assert.ok(guards.includes(StudentGuard), `${method} must enforce StudentGuard`);
    }
  });

  it('every EmployerGuard route also authenticates first via AuthGuard', () => {
    const protectedMethods = ['analyzeJob', 'generateJobDescription', 'generateInterviewQuestions', 'generateCandidateSummary'];

    for (const method of protectedMethods) {
      const guards: unknown[] = Reflect.getMetadata(metadataKey, prototype[method]) ?? [];
      assert.ok(guards.includes(AuthGuard), `${method} must run AuthGuard before EmployerGuard`);
      assert.ok(guards.includes(EmployerGuard), `${method} must enforce EmployerGuard`);
    }
  });
});