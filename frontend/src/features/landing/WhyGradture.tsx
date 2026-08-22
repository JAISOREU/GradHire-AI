import { ScrollReveal, StaggerContainer, StaggerChild } from '../../animations';
import { MOTION } from '../../animations/motion-tokens';
import { SmartMatchingVisual } from './visuals/SmartMatchingVisual';
import { ResumeParsingVisual } from './visuals/ResumeParsingVisual';
import { JobHubVisual } from './visuals/JobHubVisual';
import { RealTimeNotificationsVisual } from './visuals/RealTimeNotificationsVisual';
import { DirectMessagingVisual } from './visuals/DirectMessagingVisual';
import { ApplicationTrackingVisual } from './visuals/ApplicationTrackingVisual';
import { SkillMatchingVisual } from './visuals/SkillMatchingVisual';
import { PrivacyFirstVisual } from './visuals/PrivacyVisual';

export interface Feature {
  id: string;
  number: string;
  label: string;
  title: string;
  text: string;
  details: string;
  supporting: string[];
  highlight?: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'ai-matching',
    number: '01',
    label: 'Smart Matching',
    title: 'Smart matches',
    text: 'Find opportunities matched to your skills, interests, and goals — not just keywords.',
    details: 'Gradture AI compares the information you provide in your profile with available opportunities. Skills, experience, education, interests, and career preferences work together to make recommendations more relevant than title or keyword matching alone.',
    supporting: ['Skills', 'Experience', 'Education', 'Preferences'],
    highlight: 'AI-powered',
  },
  {
    id: 'resume-intelligence',
    number: '02',
    label: 'Resume Intelligence',
    title: 'Resume parsing',
    text: 'Upload your resume and turn its content into structured profile data.',
    details: 'Gradture AI identifies relevant skills, education, experience, projects, and other career information from your document, preparing profile fields so you do not have to enter every detail from scratch.',
    supporting: ['Skills extracted', 'Experience identified', 'Education recognized', 'Profile fields prepared'],
    highlight: 'Intelligent',
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
  },
  {
    id: 'notifications',
    number: '04',
    label: 'Real-time Updates',
    title: 'Real-time notifications',
    text: 'Stay informed when something important happens to an application or opportunity.',
    details: 'Notifications surface application updates, interview invitations, messages, and newly matched opportunities, so you do not have to repeatedly check every part of the platform for changes.',
    supporting: ['Application updates', 'Messages', 'Interview invitations', 'New opportunities'],
    highlight: 'Real-time',
  },
  {
    id: 'messaging',
    number: '05',
    label: 'Communication',
    title: 'Direct messaging',
    text: 'Communicate with employers directly inside the platform.',
    details: 'Keep relevant conversations connected to the employment journey instead of moving between separate communication channels. Follow up, ask questions, and continue discussions with hiring teams in the context of each opportunity.',
    supporting: ['Employer conversations', 'Message history', 'Online status', 'Conversation context'],
    highlight: 'Connected',
  },
  {
    id: 'applications',
    number: '06',
    label: 'Application Tracking',
    title: 'Application tracking',
    text: 'Keep every application organized in one clear timeline.',
    details: 'See where an application currently stands, whether it has been viewed or reviewed, and what the next stage may be. The progress view makes it easier to understand your status without losing track of applications.',
    supporting: ['Applied', 'Viewed', 'Review', 'Interview', 'Decision'],
    highlight: 'Organized',
  },
  {
    id: 'skills',
    number: '07',
    label: 'Skill Matching',
    title: 'Skill matching',
    text: 'Compare the skills in your profile with the requirements of an opportunity.',
    details: 'This gives you a clearer view of where you already match a role and where additional skills or experience may be useful. The comparison is based on information you provide, not skills the platform assumes you have.',
    supporting: ['Your skills', 'Role requirements', 'Matched skills', 'Missing requirements', 'Profile match'],
    highlight: 'Clear',
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
  },
];

const VISUAL_COMPONENTS: Record<number, React.FC> = {
  0: SmartMatchingVisual,
  1: ResumeParsingVisual,
  2: JobHubVisual,
  3: RealTimeNotificationsVisual,
  4: DirectMessagingVisual,
  5: ApplicationTrackingVisual,
  6: SkillMatchingVisual,
  7: PrivacyFirstVisual,
};

export const FeatureSlide = ({ feature, index }: { feature: Feature; index: number }) => {
  const isEven = index % 2 === 0;
  const VisualComponent = VISUAL_COMPONENTS[index];

  const getAnimationDirection = (): 'up' | 'left' | 'right' => {
    if (index === 0) return 'up';
    return isEven ? 'left' : 'right';
  };

  return (
    <div className={`feature-story feature-story--${feature.id} ${isEven ? 'feature-story--text-left' : 'feature-story--text-right'}`}>
      <div className="feature-story__glow" aria-hidden="true" />
      <div className="feature-story__content">
        <ScrollReveal
          options={{
            threshold: 0.2,
            once: true,
            duration: MOTION.duration.slowest,
            distance: MOTION.distance.lg,
            blur: MOTION.blur.md,
            direction: getAnimationDirection(),
          }}
        >
          <div className="feature-story__header">
            <span className="feature-story__number">{feature.number}</span>
            <span className="feature-story__label">{feature.label}</span>
          </div>
          <h3 className="feature-story__title gradient-text">
            {feature.title}
          </h3>
        </ScrollReveal>

        <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.md, direction: 'up', delay: 100 }}>
          <p className="feature-story__text">{feature.text}</p>
        </ScrollReveal>

        <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.sm, direction: 'up', delay: 200 }}>
          <p className="feature-story__details">{feature.details}</p>
        </ScrollReveal>

        <StaggerContainer options={{ stagger: MOTION.stagger.sm, once: true }} className="feature-story__supporting-wrapper">
          <ul className="feature-story__supporting" aria-label={`${feature.title} capabilities`}>
            {feature.supporting.map((item) => (
              <StaggerChild key={item}>
                <li>{item}</li>
              </StaggerChild>
            ))}
          </ul>
        </StaggerContainer>

        {feature.highlight && (
          <div className="feature-story__highlight">
            <span className="feature-story__highlight-dot" aria-hidden="true" />
            <span className="feature-story__highlight-text">{feature.highlight}</span>
          </div>
        )}
      </div>
      <div className="feature-story__visual">
        <ScrollReveal
          options={{
            threshold: 0.2,
            once: true,
            duration: MOTION.duration.slowest,
            distance: MOTION.distance.lg,
            blur: MOTION.blur.md,
            direction: getAnimationDirection(),
          }}
        >
          {VisualComponent && <VisualComponent />}
        </ScrollReveal>
      </div>
    </div>
  );
};
