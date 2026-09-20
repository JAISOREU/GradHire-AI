import { categorize, type Category } from './categorize';
import type { AiRecommendation } from '../types';

export const recommendationTitlesToCategories = (items: AiRecommendation[]): Category[] =>
  items.map((item) => categorize(item.title));