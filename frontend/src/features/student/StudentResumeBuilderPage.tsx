import { Alert } from '../../components/Alert';
import { useState } from 'react';
import { studentsApi } from '../../core/api/endpoints/students';
import { api } from '../../core/api/client';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { categorize } from '../../core/utils/categorize';
import { PhosphorIcon, type PhosphorIconName } from '../../components/PhosphorIcon';
import { PageHeader } from '../../components/PageHeader';

type Recommendation = {
  tag: string;
  icon: PhosphorIconName;
};

export const StudentResumeBuilderPage = () => {
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
      const data = await api<{ recommendations?: string[] }>('/ai/recommendations', {
        method: 'POST',
        json: { focus: profile.focus },
      });
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
      <PageHeader title="Career Suggestions" subtitle="Get tailored career direction based on your profile focus." />

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
            {error && <Alert>{error}</Alert>}

             {recommendations.length > 0 && (
               <div className="recommendation-list section--mt">
                 <h3 className="card__title">Suggested categories</h3>
                 {recommendations.map((rec, idx) => (
                   <div key={`${rec.tag}-${idx}`} className="recommendation-item">
                     <div className="recommendation-item__icon">
  <PhosphorIcon name={rec.icon} size={19} weight="duotone" />
</div>
                     <div className="recommendation-item__body">
                       <div className="recommendation-item__title">{rec.tag}</div>
                       <div className="recommendation-item__tag">Explore {rec.tag.toLowerCase()} roles</div>
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
