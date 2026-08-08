type SkipLinkProps = {
  targetId?: string;
  label?: string;
};

export const SkipLink = ({ targetId = 'main-content', label = 'Skip to main content' }: SkipLinkProps) => (
  <a href={`#${targetId}`} className="skip-link">
    {label}
  </a>
);
