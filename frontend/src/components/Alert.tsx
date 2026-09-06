type AlertProps = {
  children: React.ReactNode;
  variant?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  id?: string;
  role?: 'alert' | 'status';
};

export const Alert = ({ children, variant = 'error', className = '', id, role = 'alert' }: AlertProps) => {
  const variantClass = `message message--${variant}`;
  return (
    <div className={`${variantClass} ${className}`.trim()} role={role} id={id}>
      {children}
    </div>
  );
};

export const ErrorAlert = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <Alert variant="error" className={className} id={id}>{children}</Alert>
);
