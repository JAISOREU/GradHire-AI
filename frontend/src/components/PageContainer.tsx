import type { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export const PageContainer = ({ children, className = '' }: PageContainerProps) => (
  <div className={`auth-page ${className}`.trim()}>
    {children}
  </div>
);
