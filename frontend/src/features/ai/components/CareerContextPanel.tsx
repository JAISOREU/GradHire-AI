import { useEffect, useState } from 'react';
import { studentsApi } from '../../../core/api/endpoints/students';
import { recommendationsApi } from '../../../core/api/endpoints/jobs';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { ProgressRing } from '../../../components/ProgressRing';
import { Skeleton } from '../../../components/Skeleton';

export type CareerContext = {
  profileStrength?: number;
  matchScore?: number;
  targetRole?: string;
  topSkills: string[];
};

export const loadCareerContext = async (): Promise<CareerContext> => {
  const [completeness, prefs, skills, profile] = await Promise.allSettled([
    studentsApi.getProfileCompleteness(),
    studentsApi.getCareerPreferences(),
    studentsApi.getSkills(),
    studentsApi.getProfile(),
  ]);

  const context: CareerContext = { topSkills: [] };

  if (completeness.status === 'fulfilled' && completeness.value) {
    context.profileStrength = Math.round(completeness.value.percentage ?? 0);
  }
  if (prefs.status === 'fulfilled') {
    context.targetRole = prefs.value?.preferredJobTitles?.[0];
  }
  if (profile.status === 'fulfilled' && context.targetRole === undefined) {
    context.targetRole = profile.value?.focus || undefined;
  }
  if (skills.status === 'fulfilled' && Array.isArray(skills.value)) {
    context.topSkills = skills.value
      .map((s) => s.name)
      .filter(Boolean)
      .slice(0, 5);
  }
  if (profile.status === 'fulfilled' && context.topSkills.length === 0) {
    context.topSkills = (profile.value?.skills ?? []).slice(0, 5);
  }

  return context;
};

export const loadMatchScore = async (): Promise<number | undefined> => {
  try {
    const recommendation = await recommendationsApi.ai(5);
    const scores = (recommendation.recommendations ?? [])
      .map((r) => r.score)
      .filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
    if (scores.length === 0) return undefined;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg * 100);
  } catch {
    return undefined;
  }
};

export type CareerContextPanelProps = {
  role?: string;
};

const Stat = ({
  label,
  icon,
  children,
  dataTestId,
}: {
  label: string;
  icon: React.ComponentProps<typeof PhosphorIcon>['name'];
  children: React.ReactNode;
  dataTestId: string;
}) => (
  <div className="rail-card" data-testid={dataTestId}>
    <span className="rail-card__title">
      <PhosphorIcon name={icon} size={15} />
      {label}
    </span>
    {children}
  </div>
);

export const CareerContextPanel = ({ role }: CareerContextPanelProps) => {
  const [context, setContext] = useState<CareerContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCareerContext().then((ctx) => {
      if (!cancelled) setContext((prev) => ({ ...prev, ...ctx }));
    });
    loadMatchScore().then((score) => {
      if (cancelled) return;
      setContext((prev) => ({ ...prev, matchScore: score, topSkills: prev?.topSkills ?? [] }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="flex h-full flex-col gap-3 overflow-y-auto" aria-label="Career context">
      <div className="rail-card">
        <span className="rail-card__title">
          <PhosphorIcon name="UserCircle" size={15} />
          Your career context
        </span>
        <span className="rail-card__hint">Built from your profile and AI match</span>
      </div>

      <Stat label="Profile Strength" icon="Gauge" dataTestId="context-profile-strength">
        {context ? (
          <div className="rail-ring">
            <ProgressRing value={context.profileStrength ?? 0} size="md" />
            <div className="rail-ring__meta">
              <span className="rail-card__hint">Profile completeness</span>
            </div>
          </div>
        ) : (
          <Skeleton variant="card" lines={2} />
        )}
      </Stat>

      <Stat label="AI Match Score" icon="Sparkle" dataTestId="context-match-score">
        {context ? (
          <div className="rail-ring">
            <ProgressRing value={context.matchScore ?? 0} size="md" />
            <div className="rail-ring__meta">
              <span className="rail-card__hint">
                {context.matchScore != null ? 'Top-matching jobs' : 'No AI match available yet'}
              </span>
            </div>
          </div>
        ) : (
          <Skeleton variant="card" lines={2} />
        )}
      </Stat>

      <Stat label="Target Role" icon="Briefcase" dataTestId="context-target-role">
        <p className="rail-stats__value">{context?.targetRole ?? '—'}</p>
      </Stat>

      <Stat label="Top Skills" icon="CheckCircle" dataTestId="context-top-skills">
        {context ? (
          context.topSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {context.topSkills.map((s) => (
                <span key={s} className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="rail-card__hint">No skills yet</p>
          )
        ) : (
          <Skeleton variant="card" lines={2} />
        )}
      </Stat>

      {role && (
        <div className="rail-card rail-cta">
          <span className="rail-cta__title">Career tools</span>
          <span className="rail-card__hint">Get role-specific guidance in chat.</span>
        </div>
      )}
    </aside>
  );
};