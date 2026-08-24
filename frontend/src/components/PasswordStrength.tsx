import { useMemo } from 'react';

type PasswordStrengthProps = {
  password: string;
};

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  weak: 'bg-danger',
  fair: 'bg-warning',
  good: 'bg-info',
  strong: 'bg-success',
};

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    if (!password) return { level: 'weak' as StrengthLevel, score: 0 };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { level: 'weak' as StrengthLevel, score };
    if (score <= 3) return { level: 'fair' as StrengthLevel, score };
    if (score <= 4) return { level: 'good' as StrengthLevel, score };
    return { level: 'strong' as StrengthLevel, score };
  }, [password]);

  if (!password) return null;

  const maxScore = 6;
  const percentage = (strength.score / maxScore) * 100;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-tertiary">Password strength</span>
        <span className={`font-medium ${strength.level === 'strong' ? 'text-success' : strength.level === 'good' ? 'text-info' : strength.level === 'fair' ? 'text-warning' : 'text-danger'}`}>
          {STRENGTH_LABELS[strength.level]}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLORS[strength.level]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
