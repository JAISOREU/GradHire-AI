import { useState } from 'react';
import { studentsApi } from '../../core/api/endpoints/students';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { categorize } from '../../core/utils/categorize';

type Recommendation = {
  title: string;
  tag: string;
  icon: string;
};

export const StudentAiResumeBuilderPage = () => {
  const { data: profile, loading: profileLoading } = useAsync(() => studentsApi.getProfile(), []);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!profile?.focus) {
      setError('Update your profile focus first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus: profile.focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? 'Failed to generate recommendations');
      const items = (data.recommendations ?? []).map((title: string) => categorize(title));
      setRecommendations(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return <div className="page fade-in"><LoadingState label="Loading profile…" /></div>;
  }

  return (
    <div className="page fade-in">
      <h1 className="page-title">AI Resume Builder</h1>
      <p className="card__subtitle card__subtitle--mt">
        Generate a tailored resume from your profile and focus area.
      </p>

      <div className="form-container">
        <Card title="Build your resume">
          <div className="stack">
            <p className="card__subtitle">
              Focus: <strong>{profile?.focus ?? 'Not set'}</strong>
            </p>
            <div>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating…' : 'Generate resume suggestions'}
              </Button>
            </div>
            {error && <div className="message message--error">{error}</div>}

            {recommendations.length > 0 && (
              <div className="recommendation-list section--mt">
                <h3 className="card__title">Suggested roles</h3>
                {recommendations.map((rec) => (
                  <div key={rec.title} className="recommendation-item">
                    <div className="recommendation-item__icon">{rec.icon}</div>
                    <div className="recommendation-item__body">
                      <div className="recommendation-item__title">{rec.title}</div>
                      <div className="recommendation-item__tag">{rec.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
