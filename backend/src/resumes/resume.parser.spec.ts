import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  extractEmail,
  extractName,
  extractPhone,
  extractSkills,
  inferFocus,
  parseResumeText,
} from './resume.parser';

describe('resume parser', () => {
  const sampleDataResume = [
    'Jordan Lee',
    'jordan.lee@example.com',
    '(555) 123-4567',
    'Data Analyst with experience building dashboards in Tableau and SQL.',
    'Skills: SQL, Tableau, Python, Data Analysis, Excel',
  ].join('\n');

  const sampleAiResume = [
    'Ava Chen',
    'ava@gradture.dev',
    'Machine Learning Engineer focused on AI and deep learning.',
    'Skills: Python, TensorFlow, PyTorch, Machine Learning',
  ].join('\n');

  it('extracts email from resume text', () => {
    assert.equal(extractEmail(sampleDataResume), 'jordan.lee@example.com');
  });

  it('extracts phone from resume text', () => {
    assert.ok(extractPhone(sampleDataResume)?.includes('555'));
  });

  it('extracts a name from the first name-like line', () => {
    assert.equal(extractName(sampleDataResume), 'Jordan Lee');
  });

  it('extracts recognized skills', () => {
    const skills = extractSkills(sampleDataResume);
    assert.ok(skills.includes('SQL'));
    assert.ok(skills.includes('Tableau'));
    assert.ok(skills.includes('Data Analysis'));
  });

  it('infers a data focus when data keywords are present', () => {
    assert.ok(inferFocus(sampleDataResume).toLowerCase().includes('data'));
  });

  it('infers an AI focus when AI keywords are present', () => {
    assert.ok(inferFocus(sampleAiResume).toLowerCase().includes('ai'));
  });

  it('parses a full resume into structured fields', () => {
    const parsed = parseResumeText(sampleDataResume);
    assert.equal(parsed.name, 'Jordan Lee');
    assert.equal(parsed.email, 'jordan.lee@example.com');
    assert.ok(parsed.skills.length > 0);
    assert.ok(parsed.focus.length > 0);
    assert.ok(parsed.summary.length > 0);
  });

  it('returns null email/name when none present', () => {
    const parsed = parseResumeText('Just some plain text without structure and no contact details.');
    assert.equal(parsed.email, null);
    assert.equal(parsed.name, null);
  });
});
