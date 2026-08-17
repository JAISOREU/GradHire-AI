import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  extractEmail,
  extractName,
  extractPhone,
  extractSkills,
  inferFocus,
  extractAddress,
  extractEducation,
  extractExperience,
  extractProjects,
  parseResumeText,
} from './resume.parser';

describe('resume parser', () => {
  const sampleDataResume = [
    'Jordan Lee',
    'jordan.lee@example.com',
    '(555) 123-4567',
    '123 Main St, San Francisco, CA',
    'Data Analyst with experience building dashboards in Tableau and SQL.',
    'Skills: SQL, Tableau, Python, Data Analysis, Excel',
    'Education: BS Computer Science, Stanford University, GPA 3.8',
    'Experience: Data Analyst at Acme Corp, 2021-Present',
    'Project: Built real-time dashboard for sales analytics',
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

  it('extracts address from resume text', () => {
    const address = extractAddress(sampleDataResume);
    assert.ok(address?.includes('123 Main St'));
  });

  it('extracts education from resume text', () => {
    const education = extractEducation(sampleDataResume);
    assert.ok(education?.includes('Stanford'));
  });

  it('extracts experience from resume text', () => {
    const experience = extractExperience(sampleDataResume);
    assert.ok(experience?.includes('Acme Corp'));
  });

  it('extracts projects from resume text', () => {
    const projects = extractProjects(sampleDataResume);
    assert.ok(projects?.includes('dashboard'));
  });

  it('parses a full resume into structured fields', () => {
    const parsed = parseResumeText(sampleDataResume);
    assert.equal(parsed.name, 'Jordan Lee');
    assert.equal(parsed.email, 'jordan.lee@example.com');
    assert.ok(parsed.skills.length > 0);
    assert.ok(parsed.focus.length > 0);
    assert.ok(parsed.summary.length > 0);
    assert.ok(parsed.address?.includes('123 Main St'));
    assert.ok(parsed.education?.includes('Stanford'));
    assert.ok(parsed.experience?.includes('Acme Corp'));
    assert.ok(parsed.projects?.includes('dashboard'));
  });

  it('returns null email/name when none present', () => {
    const parsed = parseResumeText('Just some plain text without structure and no contact details.');
    assert.equal(parsed.email, null);
    assert.equal(parsed.name, null);
  });
});
