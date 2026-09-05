type ProductUiVisualProps = {
  variant: string;
};

const CONTENT: Record<string, { eyebrow: string; title: string; metric: string; items: string[] }> = {
  'ai-matching': {
    eyebrow: 'For you',
    title: 'Recommended roles',
    metric: '94% match',
    items: ['Product Designer', 'UX Researcher', 'Design Intern'],
  },
  'resume-intelligence': {
    eyebrow: 'Resume insights',
    title: 'Profile strength',
    metric: '82%',
    items: ['Skills extracted', 'Experience organized', 'Profile ready'],
  },
  'job-hub': {
    eyebrow: 'Opportunity hub',
    title: 'Find your next role',
    metric: '128 open roles',
    items: ['Remote', 'Full-time', 'Internships'],
  },
  notifications: {
    eyebrow: 'Activity',
    title: 'Stay in the loop',
    metric: '3 new updates',
    items: ['Interview invitation', 'Application viewed', 'New match'],
  },
  messaging: {
    eyebrow: 'Messages',
    title: 'Talk to employers',
    metric: 'Online now',
    items: ['Bright Labs', 'Northstar Studio', 'Acme Careers'],
  },
  applications: {
    eyebrow: 'Your applications',
    title: 'Track every step',
    metric: '4 active',
    items: ['Applied', 'In review', 'Interview'],
  },
  skills: {
    eyebrow: 'Role fit',
    title: 'See what stands out',
    metric: '12 skills matched',
    items: ['Your strengths', 'Role requirements', 'Next skills'],
  },
  security: {
    eyebrow: 'Privacy center',
    title: 'Your data, protected',
    metric: 'Secure',
    items: ['Profile visibility', 'Resume access', 'Account controls'],
  },
  '01': {
    eyebrow: 'Welcome to Gradture',
    title: 'Create your account',
    metric: 'Step 1 of 4',
    items: ['Email', 'Password', 'Name'],
  },
  '02': {
    eyebrow: 'Your profile',
    title: 'Build your profile',
    metric: '68% complete',
    items: ['Skills', 'Experience', 'Education'],
  },
  '03': {
    eyebrow: 'Explore',
    title: 'Discover opportunities',
    metric: '24 new matches',
    items: ['Search roles', 'Filter results', 'Save favorites'],
  },
  '04': {
    eyebrow: 'Next step',
    title: 'Move forward',
    metric: 'On track',
    items: ['Applied', 'Interview', 'Next step'],
  },
};

export const ProductUiVisual = ({ variant }: ProductUiVisualProps) => {
  const content = CONTENT[variant] ?? CONTENT['ai-matching'];

  return (
    <div className="product-ui" aria-hidden="true">
      <div className="product-ui__topbar">
        <span className="product-ui__dots"><i /><i /><i /></span>
        <span className="product-ui__brand">gradture<span>•</span></span>
        <span className="product-ui__avatar">A</span>
      </div>
      <div className="product-ui__body">
        <div className="product-ui__sidebar">
          <span className="product-ui__side-line product-ui__side-line--active" />
          <span className="product-ui__side-line" />
          <span className="product-ui__side-line" />
          <span className="product-ui__side-line" />
        </div>
        <div className="product-ui__main">
          <div className="product-ui__heading">
            <div>
              <span className="product-ui__eyebrow">{content.eyebrow}</span>
              <strong>{content.title}</strong>
            </div>
            <span className="product-ui__metric">{content.metric}</span>
          </div>
          <div className="product-ui__cards">
            {content.items.map((item, index) => (
              <div className="product-ui__card" key={item}>
                <span className={`product-ui__card-icon product-ui__card-icon--${index}`} />
                <span className="product-ui__card-copy">
                  <b>{item}</b>
                  <small>{index === 0 ? 'Updated just now' : 'Ready when you are'}</small>
                </span>
                <span className="product-ui__chevron">↗</span>
              </div>
            ))}
          </div>
          <div className="product-ui__footer">
            <span className="product-ui__progress"><i /></span>
            <span>Personalized for your goals</span>
          </div>
        </div>
      </div>
    </div>
  );
};
