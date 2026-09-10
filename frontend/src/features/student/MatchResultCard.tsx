import { Link } from 'react-router-dom';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import type { AiRecommendation } from '../../core/types';

export const formatMatchType = (type?: string) => {
  if (!type) return 'Hiring';
  return type === 'INTERNSHIP' ? 'Internship' : type.toLowerCase().replace('_', ' ');
};

type MatchResultCardProps = {
  job: AiRecommendation;
};

export const MatchResultCard = ({ job }: MatchResultCardProps) => {
  const score = Math.round(job.score * 100);
  const matchedSkills = job.matchedSkills ?? [];
  const matchReasons = job.matchReasons ?? [];
  const matchedEducation = job.matchedEducation ?? [];
  const matchedExperience = job.matchedExperience ?? [];
  const hasExplanation = matchReasons.length > 0 || matchedSkills.length > 0;

  return (
    <Link to={`/jobs/${job.id}`} className="list-item card--hover link-reset match-result-card">
      <div className="list-item__head">
        <div>
          <h3 className="list-item__title">{job.title}</h3>
          <div className="list-item__meta">
            <span>{job.company || 'Not specified'}</span>
            <span>{job.location || 'Remote'}</span>
            {job.workplaceType && <span>{job.workplaceType}</span>}
            <Badge kind={resolveBadgeKind(job.type)}>{formatMatchType(job.type)}</Badge>
          </div>
        </div>
        <div className="match-score flex-shrink-0 match-score--card" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${score}% match score`} aria-label={`Match score ${score}%`}>
          <div className="match-score__top"><span>Match score</span><strong>{score}%</strong></div>
          <div className="match-score__track"><div className="match-score__fill" style={{ width: `${score}%` }} /></div>
        </div>
      </div>

      {hasExplanation && (
        <div className="match-result-card__explain mt-3">
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.slice(0, 5).map((skill) => (
                <span key={skill} className="badge badge--success">
                  <PhosphorIcon name="Check" size={11} weight="bold" /> {skill}
                </span>
              ))}
            </div>
          )}
          {matchedEducation.length > 0 && (
            <div className="text-xs text-secondary mt-2">
              <strong>Education:</strong> {matchedEducation.join(', ')}
            </div>
          )}
          {matchedExperience.length > 0 && (
            <div className="text-xs text-secondary mt-1">
              <strong>Experience:</strong> {matchedExperience.join(', ')}
            </div>
          )}
          {matchReasons.length > 0 && (
            <div className="match-result-card__why mt-2">
              <span className="match-result-card__tag">
                <PhosphorIcon name="Sparkle" size={11} weight="fill" /> Transparent AI
              </span>
              {matchReasons.slice(0, 2).map((reason, idx) => (
                <span key={idx} className="text-sm text-secondary">{reason}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </Link>
  );
};