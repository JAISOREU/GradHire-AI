import { AmbientBackground } from './AmbientBackground';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBackground?: boolean;
};

export const AuthLayout = ({ title, subtitle, children, footer, showBackground = true }: AuthLayoutProps) => {
  return (
    <div className="auth-page fade-in">
      {showBackground && <AmbientBackground scene="auth" />}
      <div className="auth-card">
        <div className="auth-card__header">
          <h2>{title}</h2>
          <p className="card__subtitle">{subtitle}</p>
        </div>
        {children}
        {footer && <p className="auth-card__foot">{footer}</p>}
      </div>
    </div>
  );
};
