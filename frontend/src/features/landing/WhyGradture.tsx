import { ScrollReveal, StaggerContainer, StaggerChild } from '../../animations';
import { MOTION } from '../../animations/motion-tokens';
import {
  ProfileIntelligenceVisual,
  AIJobMatchingVisual,
  OpportunityDiscoveryVisual,
  ApplicationTrackingVisual,
  TalentPipelineVisual,
  EmployerCandidateVisual,
  AICareerGuidanceVisual,
} from './feature-visuals';
import { PrivacyInline } from './inline';

export interface Feature {
  id: string;
  number: string;
  label: string;
  title: string;
  text: string;
  details: string;
  supporting: string[];
  highlight?: string;
  layout?: 'visual-left' | 'visual-right';
}

export const FEATURES: Feature[] = [
  {
    id: 'ai-matching',
    number: '01',
    label: 'AI Matching',
    title: 'AI-powered matching',
    text: 'Get matched with roles based on your actual skills, experience, and career goals - not just keywords.',
    details: 'Gradture AI analyzes your profile, resume, and preferences against real job requirements. You will see exactly where you match and where there are gaps, so you can make informed decisions about where to apply.',
    supporting: ['Skills analysis', 'Experience match', 'Gap identification', 'Match explanation'],
    highlight: 'Transparent AI',
    layout: 'visual-left',
  },
  {
    id: 'resume-intelligence',
    number: '02',
    label: 'Resume Intelligence',
    title: 'Resume analysis',
    text: 'Upload your resume and receive an AI-powered analysis with scores, strengths, and improvement suggestions.',
    details: 'Gradture AI extracts structured data from your resume and evaluates it against job requirements. See your match score, identified strengths, missing skills, and specific recommendations for improvement — all grounded in your actual document.',
    supporting: ['Skills extracted', 'Experience identified', 'Education recognized', 'Improvement suggestions'],
    highlight: 'AI-powered',
    layout: 'visual-right',
  },
  {
    id: 'job-hub',
    number: '03',
    label: 'Job & Internship Hub',
    title: 'Job & internship hub',
    text: 'Browse jobs and internships from different sources in one place.',
    details: 'Search, filter, compare, and open job details without relying on multiple disconnected websites. Focus the discovery experience around the location, role type, and opportunity criteria that matter to you.',
    supporting: ['Search', 'Location', 'Job type', 'Remote', 'Internship', 'Experience level'],
    highlight: 'Unified',
    layout: 'visual-left',
  },
  {
    id: 'talent',
    number: '04',
    label: 'Talent Flow',
    title: 'From discovery to hire',
    text: 'Move through the hiring journey in one connected flow.',
    details: 'Gradture keeps every stage in one place: discover opportunities, match with roles, submit applications, interview, and advance — without switching between disconnected tools.',
    supporting: ['Discover', 'Match', 'Apply', 'Interview', 'Hired'],
    highlight: 'End-to-end',
    layout: 'visual-right',
  },
  {
    id: 'employers',
    number: '05',
    label: 'For Employers',
    title: 'Find the right candidates',
    text: 'Review ranked candidates, compare profiles, and move quickly from match to interview.',
    details: 'Employers get a clear view of candidate fit with match scores, skill alignment, and application context. Spend less time sorting resumes and more time interviewing people who actually fit.',
    supporting: ['Candidate ranking', 'Match scores', 'Skill alignment', 'Application context'],
    highlight: 'Hiring made clear',
    layout: 'visual-left',
  },
  {
    id: 'ai-intelligence',
    number: '06',
    label: 'AI Intelligence',
    title: 'Explainable match insights',
    text: 'Understand why a role fits, not just that it fits.',
    details: 'Every match includes an AI insight explaining the reasoning behind the recommendation. See strengths, gaps, and concrete suggestions so both candidates and employers can act with clarity.',
    supporting: ['Match explanation', 'Strengths', 'Improvement areas', 'Transparent reasoning'],
    highlight: 'Explainable AI',
    layout: 'visual-right',
  },
  {
    id: 'applications',
    number: '07',
    label: 'Applications',
    title: 'Track every application',
    text: 'Keep every application organized in one clear timeline.',
    details: 'See where an application currently stands, whether it has been viewed or reviewed, and what the next stage may be. The progress view makes it easier to understand your status without losing track of applications.',
    supporting: ['Applied', 'Screening', 'Interview', 'Offer'],
    highlight: 'Organized',
    layout: 'visual-left',
  },
  {
    id: 'security',
    number: '08',
    label: 'Privacy & Security',
    title: 'Privacy first',
    text: 'Keep sensitive career information protected throughout your employment journey.',
    details: 'Profiles can include resumes, education, experience, applications, and conversations. Gradture AI minimizes unnecessary exposure and uses appropriate access controls so information is available to the people and systems that need it while remaining protected from unauthorized access.',
    supporting: ['Profile', 'Resume', 'Applications', 'Messages', 'Protected'],
    highlight: 'Secure',
    layout: 'visual-right',
  },
];

const VISUAL_COMPONENTS: Record<number, React.FC> = {
  0: AIJobMatchingVisual,
  1: ProfileIntelligenceVisual,
  2: OpportunityDiscoveryVisual,
  3: TalentPipelineVisual,
  4: EmployerCandidateVisual,
  5: AICareerGuidanceVisual,
  6: ApplicationTrackingVisual,
  7: PrivacyInline,
};

export const FeatureSlide = ({ feature, index }: { feature: Feature; index: number }) => {
  const VisualComponent = VISUAL_COMPONENTS[index];
  const isReverse = feature.layout === 'visual-left';
  const isWideVisual = feature.id === 'resume-intelligence';

  return (
    <div className={`feature-section ${isReverse ? 'feature-section--reverse' : ''} ${isWideVisual ? 'feature-section--wide-visual' : ''}`}>
        <div className="feature-section__content">
          <ScrollReveal
            options={{
              threshold: 0.2,
              once: true,
              duration: MOTION.duration.slower,
              distance: MOTION.distance.md,
              direction: 'up',
            }}
          >
            <div className="feature-section__header">
              <span className="feature-section__number">{feature.number}</span>
              <span className="feature-section__label">{feature.label}</span>
            </div>
            <h2 className="feature-section__title">{feature.title}</h2>
          </ScrollReveal>

          <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.sm, direction: 'up', delay: 100 }}>
            <p className="feature-section__text">{feature.text}</p>
          </ScrollReveal>

          <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.sm, direction: 'up', delay: 150 }}>
            <p className="feature-section__details">{feature.details}</p>
          </ScrollReveal>

          <StaggerContainer options={{ stagger: MOTION.stagger.sm, once: true, threshold: 0.2 }} className="feature-section__supporting">
            {feature.supporting.map((item) => (
              <StaggerChild key={item}>
                <span className="feature-section__chip">{item}</span>
              </StaggerChild>
            ))}
          </StaggerContainer>

          {feature.highlight && (
            <div className="feature-section__highlight">
              <span className="feature-section__highlight-dot" aria-hidden="true" />
              <span>{feature.highlight}</span>
            </div>
          )}
        </div>

        <div className="feature-section__visual">
          <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.md, direction: 'up', delay: 100 }}>
            {VisualComponent && <VisualComponent />}
          </ScrollReveal>
        </div>
    </div>
  );
};
