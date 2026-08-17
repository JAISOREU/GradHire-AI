import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { AuthGuard } from './auth.guard';
import { StudentGuard } from './student.guard';
import { EmployerGuard } from './employer.guard';
import { AdminGuard } from './admin.guard';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

function createMockContext(user?: { role: string }, token?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        headers: token ? { authorization: `Bearer ${token}` } : {},
        cookies: token ? { access_token: token } : {},
      }),
    }),
  } as never;
}

const mockAuthService = {
  validateToken: async (token: string) => {
    if (token === 'valid-student') return { id: 'stu-1', email: 'student@test.dev', role: 'STUDENT' };
    if (token === 'valid-employer') return { id: 'emp-1', email: 'employer@test.dev', role: 'EMPLOYER' };
    if (token === 'valid-admin') return { id: 'adm-1', email: 'admin@test.dev', role: 'ADMIN' };
    throw new UnauthorizedException('Invalid token');
  },
};

const authGuard = new AuthGuard(mockAuthService as never);
const studentGuard = new StudentGuard();
const employerGuard = new EmployerGuard();
const adminGuard = new AdminGuard();

test('AuthGuard accepts valid Bearer token', async () => {
  const result = await authGuard.canActivate(createMockContext(undefined, 'valid-student'));
  assert.equal(result, true);
});

test('AuthGuard accepts valid cookie token', async () => {
  const result = await authGuard.canActivate(createMockContext(undefined, 'valid-employer'));
  assert.equal(result, true);
});

test('AuthGuard rejects missing token', async () => {
  await assert.rejects(() => authGuard.canActivate(createMockContext()), UnauthorizedException);
});

test('AuthGuard rejects invalid token', async () => {
  await assert.rejects(() => authGuard.canActivate(createMockContext(undefined, 'invalid')), UnauthorizedException);
});

test('StudentGuard allows STUDENT role', async () => {
  const ctx = createMockContext({ role: 'STUDENT' });
  const result = await studentGuard.canActivate(ctx);
  assert.equal(result, true);
});

test('StudentGuard blocks EMPLOYER role', async () => {
  await assert.rejects(() => studentGuard.canActivate(createMockContext({ role: 'EMPLOYER' })), ForbiddenException);
});

test('StudentGuard blocks ADMIN role', async () => {
  await assert.rejects(() => studentGuard.canActivate(createMockContext({ role: 'ADMIN' })), ForbiddenException);
});

test('StudentGuard blocks unauthenticated user', async () => {
  await assert.rejects(() => studentGuard.canActivate(createMockContext()), ForbiddenException);
});

test('EmployerGuard allows EMPLOYER role', async () => {
  const ctx = createMockContext({ role: 'EMPLOYER' });
  const result = await employerGuard.canActivate(ctx);
  assert.equal(result, true);
});

test('EmployerGuard blocks STUDENT role', async () => {
  await assert.rejects(() => employerGuard.canActivate(createMockContext({ role: 'STUDENT' })), ForbiddenException);
});

test('EmployerGuard blocks ADMIN role', async () => {
  await assert.rejects(() => employerGuard.canActivate(createMockContext({ role: 'ADMIN' })), ForbiddenException);
});

test('EmployerGuard blocks unauthenticated user', async () => {
  await assert.rejects(() => employerGuard.canActivate(createMockContext()), ForbiddenException);
});

test('AdminGuard allows ADMIN role', async () => {
  const ctx = createMockContext({ role: 'ADMIN' });
  const result = await adminGuard.canActivate(ctx);
  assert.equal(result, true);
});

test('AdminGuard blocks STUDENT role', async () => {
  await assert.rejects(() => adminGuard.canActivate(createMockContext({ role: 'STUDENT' })), ForbiddenException);
});

test('AdminGuard blocks EMPLOYER role', async () => {
  await assert.rejects(() => adminGuard.canActivate(createMockContext({ role: 'EMPLOYER' })), ForbiddenException);
});

test('AdminGuard blocks unauthenticated user', async () => {
  await assert.rejects(() => adminGuard.canActivate(createMockContext()), ForbiddenException);
});
