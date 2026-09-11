import { SkillGapStrip } from '../../../components/SkillGapStrip';

type DashboardCareerIntelProps = {
  currentSkills: string[];
  gaps: string[];
  loading?: boolean;
};

export const DashboardCareerIntel = ({ currentSkills, gaps, loading }: DashboardCareerIntelProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-surface-muted mb-4" />
        <div className="h-10 animate-pulse rounded bg-surface-muted" />
      </div>
    );
  }

  if (currentSkills.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <h2 className="text-base font-semibold text-text mb-2">Career Intelligence</h2>
        <p className="text-sm text-text-secondary text-center py-2">
          Complete your profile to unlock career intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <h2 className="text-base font-semibold text-text mb-3">Career Intelligence</h2>
      <SkillGapStrip currentSkills={currentSkills} gaps={gaps} />
    </div>
  );
};