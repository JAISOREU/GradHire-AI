import { describe, it, expect } from 'vitest';
import { recommendationTitlesToCategories } from './recommendations';
import { AiRecommendation } from '../types';

const makeRec = (title: string): AiRecommendation => ({
  id: title,
  title,
  type: 'JOB',
  score: 0.9,
  description: '',
});

describe('recommendationTitlesToCategories', () => {
  it('maps each recommendation title through categorize', () => {
    const categories = recommendationTitlesToCategories([
      makeRec('Data Analyst'),
      makeRec('AI Product Engineer'),
      makeRec('Something unknown entirely'),
    ]);

    expect(categories).toHaveLength(3);
    expect(categories[0]).toEqual({ tag: 'Data', icon: 'ChartBar' });
    expect(categories[1].tag).toBe('Recommended');
    expect(categories[2]).toEqual({ tag: 'Career', icon: 'Rocket' });
  });

  it('returns an empty list for an empty input', () => {
    expect(recommendationTitlesToCategories([])).toEqual([]);
  });
});