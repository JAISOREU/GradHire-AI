import { describe, it, after } from 'node:test';
import * as assert from 'node:assert/strict';
import { GlobalExceptionFilter } from './global-exception.filter';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

const makeHost = () => {
  const json = { wrote: false as boolean, body: undefined as unknown };
  const response = {
    status: () => ({
      json: (body: unknown) => {
        json.wrote = true;
        json.body = body;
      },
    }),
  };
  const request = { url: '/api/v1/test', method: 'POST' };
  const host = {
    switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
  };
  return { host: host as unknown as ArgumentsHost, json };
};

describe('GlobalExceptionFilter', () => {
  const previousEnv = process.env.NODE_ENV;

  after(() => {
    process.env.NODE_ENV = previousEnv;
  });

  it('maps Prisma P2025 (record not found) to HTTP 404, not 500', () => {
    process.env.NODE_ENV = 'production';
    const filter = new GlobalExceptionFilter();
    const { host, json } = makeHost();
    const prismaError = Object.assign(new Error('An operation failed because it depends on one or more records that were required but not found'), { code: 'P2025' });

    filter.catch(prismaError, host);

    assert.equal(json.wrote, true);
    const body = json.body as { statusCode: number; message: string };
    assert.equal(body.statusCode, HttpStatus.NOT_FOUND);
    assert.equal(body.message, 'Resource not found');
  });

  it('maps Prisma P2002 (unique constraint) to HTTP 409, not 500', () => {
    process.env.NODE_ENV = 'production';
    const filter = new GlobalExceptionFilter();
    const { host, json } = makeHost();
    const prismaError = Object.assign(new Error('Unique constraint failed on the fields'), { code: 'P2002' });

    filter.catch(prismaError, host);

    assert.equal(json.wrote, true);
    const body = json.body as { statusCode: number; message: string };
    assert.equal(body.statusCode, HttpStatus.CONFLICT);
    assert.equal(body.message, 'A record with this value already exists');
  });

  it('does not leak internal error details in production for unknown failures', () => {
    process.env.NODE_ENV = 'production';
    const filter = new GlobalExceptionFilter();
    const { host, json } = makeHost();

    filter.catch(new Error('internal db password=supersecret connection refused'), host);

    const body = json.body as { statusCode: number; message: string };
    assert.equal(body.statusCode, HttpStatus.INTERNAL_SERVER_ERROR);
    assert.equal(body.message, 'Internal server error');
    assert.equal('stack' in body, false);
  });

  it('keeps the HttpException status and message for domain errors', () => {
    process.env.NODE_ENV = 'production';
    const filter = new GlobalExceptionFilter();
    const { host, json } = makeHost();

    filter.catch(new BadRequestException('You have already applied to this job'), host);

    const body = json.body as { statusCode: number; message: string };
    assert.equal(body.statusCode, HttpStatus.BAD_REQUEST);
    assert.equal(body.message, 'You have already applied to this job');
  });
});