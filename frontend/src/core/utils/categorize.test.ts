import { describe, it, expect } from 'vitest';
import { categorize } from './categorize';

describe('categorize', () => {
  it('returns Engineering tag for software engineer roles', () => {
    const result = categorize('Software Engineer Intern');
    expect(result.tag).toBe('Engineering');
    expect(result.icon).toBe('💻');
  });

  it('returns Engineering tag for senior engineer roles', () => {
    const result = categorize('Senior Software Engineer');
    expect(result.tag).toBe('Engineering');
  });

  it('returns Recommended tag for machine learning roles', () => {
    const result = categorize('Machine Learning Engineer');
    expect(result.tag).toBe('Recommended');
    expect(result.icon).toBe('🤖');
  });

  it('returns Data tag for analyst roles', () => {
    const result = categorize('Data Analyst');
    expect(result.tag).toBe('Data');
    expect(result.icon).toBe('📊');
  });

  it('returns Product & Design tag for product designer roles', () => {
    const result = categorize('Product Designer');
    expect(result.tag).toBe('Product & Design');
    expect(result.icon).toBe('🎨');
  });

  it('returns Career fallback for unknown roles', () => {
    const result = categorize('Chief of Something');
    expect(result.tag).toBe('Career');
    expect(result.icon).toBe('🚀');
  });
});
