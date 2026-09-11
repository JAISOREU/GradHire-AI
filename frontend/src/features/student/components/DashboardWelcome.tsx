import type { ReactNode } from 'react';

type DashboardWelcomeProps = {
  name: string;
  subtitle?: string;
  children?: ReactNode;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardWelcome = ({ name, subtitle, children }: DashboardWelcomeProps) => (
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/10">
    <div className="relative z-10">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">
        {getGreeting()}, {name}
      </h1>
      <p className="mt-1 text-text-secondary">
        {subtitle || "Here's what's happening with your career search."}
      </p>
      {children}
    </div>
  </section>
);