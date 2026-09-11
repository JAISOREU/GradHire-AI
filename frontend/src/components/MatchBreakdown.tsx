import { ProgressRing } from './ProgressRing';
import { ProgressBar } from './ProgressBar';

type MatchBreakdownProps = {
  score: number;
  skills: number;
  experience: number;
  education: number;
  preferences: number;
};

export const MatchBreakdown = ({ score, skills, experience, education, preferences }: MatchBreakdownProps) => (
  <div className="space-y-4">
    <div className="flex justify-center">
      <ProgressRing value={score} size="lg" />
    </div>
    <div className="space-y-3">
      <ProgressBar value={skills} label="Skills" />
      <ProgressBar value={experience} label="Experience" />
      <ProgressBar value={education} label="Education" />
      <ProgressBar value={preferences} label="Preferences" />
    </div>
  </div>
);