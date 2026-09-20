import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JobQueryDto } from './job.dto';

describe('JobQueryDto', () => {
  it('coerces a single skills query value into a string array', async () => {
    const dto = plainToInstance(JobQueryDto, { skills: 'React' });

    const errors = await validate(dto);

    assert.equal(errors.length, 0);
    assert.deepEqual(dto.skills, ['React']);
  });

  it('keeps repeated skills query values as a string array', async () => {
    const dto = plainToInstance(JobQueryDto, { skills: ['React', 'Node.js'] });

    const errors = await validate(dto);

    assert.equal(errors.length, 0);
    assert.deepEqual(dto.skills, ['React', 'Node.js']);
  });

  it('accepts valid datePosted values and rejects invalid ones', async () => {
    const ok = plainToInstance(JobQueryDto, { datePosted: '7d' });
    const okErrors = await validate(ok);
    assert.equal(okErrors.length, 0);

    const bad = plainToInstance(JobQueryDto, { datePosted: '12z' });
    const badErrors = await validate(bad);
    assert.equal(badErrors.length, 1);
  });

  it('accepts asc/desc for sortOrder and rejects anything else', async () => {
    for (const direction of ['asc', 'desc']) {
      const ok = plainToInstance(JobQueryDto, { sortOrder: direction });
      const okErrors = await validate(ok);
      assert.equal(okErrors.length, 0, `${direction} should be valid`);
    }

    const bad = plainToInstance(JobQueryDto, { sortOrder: 'sideways' });
    const badErrors = await validate(bad);
    assert.equal(badErrors.length, 1);
  });
});