import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { InternalServerErrorException } from '@nestjs/common';
import { EmailService } from './email.service';

test('send() throws in production when RESEND_API_KEY is not configured', async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevKey = process.env.RESEND_API_KEY;
  process.env.NODE_ENV = 'production';
  delete process.env.RESEND_API_KEY;
  try {
    const svc = new EmailService();
    await assert.rejects(
      () => svc.send({ to: 'x@test.dev', subject: 's', text: 't' }),
      InternalServerErrorException,
    );
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = prevKey;
  }
});

test('send() dry-runs in development when RESEND_API_KEY is not configured', async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevKey = process.env.RESEND_API_KEY;
  process.env.NODE_ENV = 'development';
  delete process.env.RESEND_API_KEY;
  try {
    const svc = new EmailService();
    const result = await svc.send({ to: 'x@test.dev', subject: 's', text: 't' });
    assert.equal(result.status, 'DRY_RUN');
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = prevKey;
  }
});