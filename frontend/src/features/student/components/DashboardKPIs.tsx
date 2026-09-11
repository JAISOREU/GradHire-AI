import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../../../components/ProgressRing';
import { BentoGrid, BentoItem } from '../../../components/BentoGrid';

type KPIData = {
  profileStrength: number;
  matchScore: number;
  applicationsInProgress: number;
  savedJobs: number;
};

type DashboardKPIsProps = {
  data: KPIData;
};

export const DashboardKPIs = ({ data }: DashboardKPIsProps) => {
  const navigate = useNavigate();

  return (
    <BentoGrid columns={4}>
      <BentoItem>
        <button
          onClick={() => navigate('/student/account')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">Profile Strength</p>
          <ProgressRing value={data.profileStrength} size="md" />
        </button>
      </BentoItem>

      <BentoItem>
        <button
          onClick={() => navigate('/student/recommended')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">AI Match Score</p>
          <ProgressRing value={data.matchScore} size="md" />
        </button>
      </BentoItem>

      <BentoItem>
        <button
          onClick={() => navigate('/student/applications')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">In Progress</p>
          <p className="text-3xl font-bold text-text">{data.applicationsInProgress}</p>
          <p className="text-xs text-text-secondary mt-1">applications</p>
        </button>
      </BentoItem>

      <BentoItem>
        <button
          onClick={() => navigate('/student/saved')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">Saved Jobs</p>
          <p className="text-3xl font-bold text-text">{data.savedJobs}</p>
          <p className="text-xs text-text-secondary mt-1">jobs saved</p>
        </button>
      </BentoItem>
    </BentoGrid>
  );
};