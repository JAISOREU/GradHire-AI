import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { companiesApi } from '../../../core/api/endpoints/companies';
import { useAsync } from '../../../core/hooks/useAsync';

export const SkillsSidebar = () => {
  const { data, loading, error } = useAsync(() => companiesApi.hiringForSkills(), []);
  const skills = data ?? [];

  return (
    <section className="rail-card" aria-label="Companies hiring for your skills">
      <h2 className="rail-card__title">
        <PhosphorIcon name="Buildings" size={16} />
        Companies hiring for your skills
      </h2>

      {loading ? (
        <p className="rail-card__hint">Loading companies…</p>
      ) : error ? (
        <p className="rail-card__hint">Could not load companies. Try again later.</p>
      ) : skills.length === 0 ? (
        <p className="rail-card__hint">
          Add skills to your profile to see which companies are hiring for them.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {skills.map(({ skill, companies }) => (
            <li key={skill} className="rail-ring">
              <span className="badge badge--primary">
                <span>{skill}</span>
              </span>
              <div className="rail-ring__meta">
                <span className="text-sm font-semibold">
                  {companies} {companies === 1 ? 'company' : 'companies'}
                </span>
                <span className="rail-card__hint">match your skills</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};