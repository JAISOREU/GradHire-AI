import { Alert } from '../../components/Alert';
import { useState } from 'react';
import { studentsApi } from '../../core/api/endpoints/students';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { recommendationTitlesToCategories } from '../../core/utils/recommendations';
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
      setError('Set your profile focus first to get started.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await recommendationsApi.ai(5);
      setRecommendations(recommendationTitlesToCategories(data.recommendations));
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
      <PageHeader title="Career suggestions" subtitle="Get tailored career direction based on your profile focus." />

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
