import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type SkillGapStripProps = {
  currentSkills: string[];
  gaps: string[];
  recommendations?: ReactNode;
  className?: string;
};

export const SkillGapStrip = ({ currentSkills, gaps, recommendations, className }: SkillGapStripProps) => (
  <div className={cn('flex items-start gap-6 overflow-x-auto py-2', className)}>
    <div className="flex-shrink-0">
      <p className="text-xs font-medium text-text-secondary mb-2">Current Skills</p>
      <div className="flex flex-wrap gap-1.5">
        {currentSkills.map((s) => (
          <span key={s} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
        ))}
      </div>
    </div>
    {gaps.length > 0 && (
      <div className="flex-shrink-0">
        <p className="text-xs font-medium text-text-secondary mb-2">Skill Gaps</p>
        <div className="flex flex-wrap gap-1.5">
          {gaps.map((s) => (
            <span key={s} className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">{s}</span>
          ))}
        </div>
      </div>
    )}
    {recommendations && (
      <div className="flex-shrink-0">
        <p className="text-xs font-medium text-text-secondary mb-2">Recommended</p>
        {recommendations}
      </div>
    )}
  </div>
);