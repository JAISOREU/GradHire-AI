import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { isAllowedCrossOriginRequest } from './origin-check';

const ALLOWED = ['http://localhost:5173', 'http://localhost:3000', 'https://grad-hire-ai.vercel.app'];

test('allows request from an allowed origin', () => {
  assert.equal(isAllowedCrossOriginRequest('http://localhost:5173', undefined, ALLOWED), true);
});

test('allows request with an allowed referer when origin is absent (same-origin form post)', () => {
  assert.equal(isAllowedCrossOriginRequest(undefined, 'http://localhost:5173/register', ALLOWED), true);
});

test('blocks request from a cross-origin origin (CSRF vector)', () => {
  assert.equal(isAllowedCrossOriginRequest('https://evil.example.com', undefined, ALLOWED), false);
});

test('blocks cross-origin referer when origin is absent', () => {
  assert.equal(isAllowedCrossOriginRequest(undefined, 'https://evil.example.com/post', ALLOWED), false);
});

test('allows request without origin or referer (native / server-to-server client)', () => {
  assert.equal(isAllowedCrossOriginRequest(undefined, undefined, ALLOWED), true);
});

test('blocks malformed origin value', () => {
  assert.equal(isAllowedCrossOriginRequest('not a url', undefined, ALLOWED), false);
});

test('allows SPA-history referer that nests a path under the allowed origin', () => {
  assert.equal(isAllowedCrossOriginRequest(undefined, 'http://localhost:5173/student/jobs', ALLOWED), true);
});