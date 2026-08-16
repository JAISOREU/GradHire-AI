import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import { sanitizeDatabaseString, sanitizeFilename } from './sanitize';

describe('sanitize', () => {
  test('removes NUL bytes from strings', () => {
    assert.equal(sanitizeDatabaseString('resume\0.pdf'), 'resume.pdf');
    assert.equal(sanitizeDatabaseString('a\0b\0c'), 'abc');
  });

  test('removes other control characters', () => {
    const input = 'hello\x01\x02\x03world';
    assert.equal(sanitizeDatabaseString(input), 'helloworld');
  });

  test('preserves normal Unicode and punctuation', () => {
    const input = 'Résumé 2026 – Final.pdf';
    assert.equal(sanitizeDatabaseString(input), 'Résumé 2026 – Final.pdf');
  });

  test('handles null and undefined safely', () => {
    assert.equal(sanitizeDatabaseString(null), '');
    assert.equal(sanitizeDatabaseString(undefined), '');
    assert.equal(sanitizeDatabaseString(''), '');
  });

  test('coerces non-strings safely', () => {
    assert.equal(sanitizeDatabaseString(123 as unknown), '123');
    assert.equal(sanitizeDatabaseString(true as unknown), 'true');
  });

  test('sanitizeFilename removes NUL and unsafe chars', () => {
    assert.equal(sanitizeFilename('resume\0.pdf'), 'resume.pdf');
    assert.equal(sanitizeFilename('../etc/passwd'), '__etc_passwd');
    assert.equal(sanitizeFilename('normal.pdf'), 'normal.pdf');
  });
});
