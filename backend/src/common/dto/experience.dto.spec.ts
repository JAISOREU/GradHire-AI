import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { validate } from 'class-validator';
import { CreateExperienceDto, UpdateExperienceDto } from './experience.dto';

const validBase = {
  jobTitle: 'Software Engineer Intern',
  company: 'Acme Corp',
  startDate: '2026-06-01',
};

describe('CreateExperienceDto', () => {
  it('rejects a non-empty employmentType that is not a valid enum value', async () => {
    const dto = Object.assign(new CreateExperienceDto(), validBase, { employmentType: 'NOT_A_TYPE' });
    const errors = await validate(dto);

    assert.ok(errors.some((e) => e.property === 'employmentType'), 'expected employmentType validation error');
  });

  it('accepts an empty-string employmentType (means unset, not an enum)', async () => {
    const dto = Object.assign(new CreateExperienceDto(), validBase, { employmentType: '' });
    const errors = await validate(dto);

    assert.ok(!errors.some((e) => e.property === 'employmentType'), 'empty employmentType should be tolerated');
  });
});

describe('UpdateExperienceDto', () => {
  it('rejects a non-empty employmentType that is not a valid enum value', async () => {
    const dto = Object.assign(new UpdateExperienceDto(), { employmentType: 'BOGUS' });
    const errors = await validate(dto);

    assert.ok(errors.some((e) => e.property === 'employmentType'), 'expected employmentType validation error');
  });

  it('accepts an empty-string employmentType', async () => {
    const dto = Object.assign(new UpdateExperienceDto(), { employmentType: '' });
    const errors = await validate(dto);

    assert.ok(!errors.some((e) => e.property === 'employmentType'), 'empty employmentType should be tolerated');
  });
});