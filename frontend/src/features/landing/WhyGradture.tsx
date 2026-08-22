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
  },
  {
    id: 'resume-intelligence',
    number: '02',
    label: 'Resume Intelligence',
    title: 'Resume parsing',
    text: 'Upload your resume and turn its content into structured profile data.',
    details: 'Gradture AI identifies relevant skills, education, experience, projects, and other career information from your document, preparing profile fields so you do not have to enter every detail from scratch.',
    supporting: ['Skills extracted', 'Experience identified', 'Education recognized', 'Profile fields prepared'],
  },
  {
    id: 'job-hub',
    number: '03',
    label: 'Job & Internship Hub',
    title: 'Job & internship hub',
    text: 'Browse jobs and internships from different sources in one place.',
    details: 'Search, filter, compare, and open job details without relying on multiple disconnected websites. Focus the discovery experience around the location, role type, and opportunity criteria that matter to you.',
    supporting: ['Search', 'Location', 'Job type', 'Remote', 'Internship', 'Experience level'],
  },
  {
    id: 'notifications',
    number: '04',
    label: 'Real-time Updates',
    title: 'Real-time notifications',
    text: 'Stay informed when something important happens to an application or opportunity.',
    details: 'Notifications surface application updates, interview invitations, messages, and newly matched opportunities, so you do not have to repeatedly check every part of the platform for changes.',
    supporting: ['Application updates', 'Messages', 'Interview invitations', 'New opportunities'],
  },
  {
    id: 'messaging',
    number: '05',
    label: 'Communication',
    title: 'Direct messaging',
    text: 'Communicate with employers directly inside the platform.',
    details: 'Keep relevant conversations connected to the employment journey instead of moving between separate communication channels. Follow up, ask questions, and continue discussions with hiring teams in the context of each opportunity.',
    supporting: ['Employer conversations', 'Message history', 'Online status', 'Conversation context'],
  },
  {
    id: 'applications',
    number: '06',
    label: 'Application Tracking',
    title: 'Application tracking',
    text: 'Keep every application organized in one clear timeline.',
    details: 'See where an application currently stands, whether it has been viewed or reviewed, and what the next stage may be. The progress view makes it easier to understand your status without losing track of applications.',
    supporting: ['Applied', 'Viewed', 'Review', 'Interview', 'Decision'],
  },
  {
    id: 'skills',
    number: '07',
    label: 'Skill Matching',
    title: 'Skill matching',
    text: 'Compare the skills in your profile with the requirements of an opportunity.',
    details: 'This gives you a clearer view of where you already match a role and where additional skills or experience may be useful. The comparison is based on information you provide, not skills the platform assumes you have.',
    supporting: ['Your skills', 'Role requirements', 'Matched skills', 'Missing requirements', 'Profile match'],
  },
  {
    id: 'security',
    number: '08',
    label: 'Privacy & Security',
    title: 'Privacy first',
    text: 'Keep sensitive career information protected throughout your employment journey.',
    details: 'Profiles can include resumes, education, experience, applications, and conversations. Gradture AI minimizes unnecessary exposure and uses appropriate access controls so information is available to the people and systems that need it while remaining protected from unauthorized access.',
    supporting: ['Profile', 'Resume', 'Applications', 'Messages', 'Protected'],
  },
];

export const FeatureSlide = ({ feature, index }: { feature: Feature; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`feature-story feature-story--${feature.id} ${isEven ? 'feature-story--text-left' : 'feature-story--text-right'}`}>
      <div className="feature-story__glow" aria-hidden="true" />
      <div className="feature-story__content">
        <div className="feature-story__header">
          <span className="feature-story__number">{feature.number}</span>
          <span className="feature-story__label">{feature.label}</span>
        </div>
        <h3 className="feature-story__title">
          {feature.title.split(' ').map((word, i, arr) => {
            const isLast = i === arr.length - 1;
            if (isLast && arr.length > 1) {
              return (
                <span key={i} className="gradient-text">
                  {word}{' '}
                </span>
              );
            }
            return <span key={i}>{word} </span>;
          })}
        </h3>
        <p className="feature-story__text">{feature.text}</p>
        <p className="feature-story__details">{feature.details}</p>
        <ul className="feature-story__supporting" aria-label={`${feature.title} capabilities`}>
          {feature.supporting.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="feature-story__visual">
        {index === 0 && <SmartMatchingVisual />}
        {index === 1 && <ResumeParsingVisual />}
        {index === 2 && <JobHubVisual />}
        {index === 3 && <RealTimeNotificationsVisual />}
        {index === 4 && <DirectMessagingVisual />}
        {index === 5 && <ApplicationTrackingVisual />}
        {index === 6 && <SkillMatchingVisual />}
        {index === 7 && <PrivacyFirstVisual />}
      </div>
    </div>
  );
};
