import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { AuthLayout } from '../../components/AuthLayout';
import { Alert } from '../../components/Alert';
import { Skeleton } from '../../components/Skeleton';
import { roleHomePath } from '../../core/utils/navigation';
import { getRoleLabel } from '../../core/utils/roleLabels';
import type { UserRole } from '../../core/types';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.095-1.695-.375-.3-1.095-.735.015-.75 1.08-.015 1.845.99 2.205 1.41 1.29 1.71 3.345 1.23 4.17.93.135-.735.54-1.23.975-1.515-3.375-.375-6.9-1.68-6.9-7.47 0-1.65.585-3 1.545-4.05-.15-.375-.67-1.89.15-3.93 0 0 1.26-.405 4.125 1.545 1.2-.33 2.475-.495 3.75-.495s2.55.165 3.75.495c2.865-1.95 4.125-1.545 4.125-1.545.82 2.04.3 3.555.15 3.93.96 1.05 1.545 2.4 1.545 4.05 0 5.805-3.54 7.095-6.915 7.47.54.465 1.005 1.365 1.005 2.76 0 1.995-.015 3.6-.015 4.095 0 .42.225.915.84.765C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" fill="currentColor" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" />
  </svg>
);

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().optional(),
  role: z.enum(['STUDENT', 'EMPLOYER']),
});

type RegisterValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: registerSchema,
    initialValues: { email: '', password: '', name: '', role: 'STUDENT' },
    onSubmit: async (values: RegisterValues) => {
      const user = await register(values.email, values.password, values.role, values.name || undefined);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

  const handleOAuth = async (provider: 'google' | 'github' | 'linkedin') => {
    setOauthLoading(provider);
    try {
      await oauthLogin(provider);
    } catch {
      setOauthLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join as talent or an employer."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <div className="stack mt-4 space-y-3">
        <Button type="button" variant="secondary" className="w-full" disabled={isSubmitting || !!oauthLoading} onClick={() => handleOAuth('google')}>
          {oauthLoading === 'google' ? (
            'Connecting to Google…'
          ) : (
            <>
              <span className="flex items-center justify-center gap-2">
                <GoogleIcon />
                <span className="font-medium">Continue with Google</span>
              </span>
            </>
          )}
        </Button>
        <Button type="button" variant="secondary" className="w-full" disabled={isSubmitting || !!oauthLoading} onClick={() => handleOAuth('github')}>
          {oauthLoading === 'github' ? (
            'Connecting to GitHub…'
          ) : (
            <>
              <span className="flex items-center justify-center gap-2">
                <GitHubIcon />
                <span className="font-medium">Continue with GitHub</span>
              </span>
            </>
          )}
        </Button>
        <Button type="button" variant="secondary" className="w-full" disabled={isSubmitting || !!oauthLoading} onClick={() => handleOAuth('linkedin')}>
          {oauthLoading === 'linkedin' ? (
            'Connecting to LinkedIn…'
          ) : (
            <>
              <span className="flex items-center justify-center gap-2">
                <LinkedInIcon />
                <span className="font-medium">Continue with LinkedIn</span>
              </span>
            </>
          )}
        </Button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-text-tertiary">Or continue with email</span>
        </div>
      </div>

      {isSubmitting ? (
        <div className="stack mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <Skeleton lines={3} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="stack mt-4 space-y-4">
          <div className="role-picker" role="group" aria-label="Account type">
            <button
              type="button"
              className={selectedRole === 'STUDENT' ? 'role-option is-selected' : 'role-option'}
              onClick={() => { setSelectedRole('STUDENT'); handleChange('role', 'STUDENT'); }}
              aria-pressed={selectedRole === 'STUDENT'}
            >
              <strong>{getRoleLabel('STUDENT')}</strong>
              <span>Browse jobs, apply, get recommendations</span>
            </button>
            <button
              type="button"
              className={selectedRole === 'EMPLOYER' ? 'role-option is-selected' : 'role-option'}
              onClick={() => { setSelectedRole('EMPLOYER'); handleChange('role', 'EMPLOYER'); }}
              aria-pressed={selectedRole === 'EMPLOYER'}
            >
              <strong>{getRoleLabel('EMPLOYER')}</strong>
              <span>Post jobs and review applicants</span>
            </button>
          </div>
          <FormInput
            label="Name (optional)"
            id="reg-name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value.trim())}
            onBlur={() => handleBlur('name')}
            placeholder="Your name"
            error={touched.name ? errors.name : undefined}
          />
          <FormInput
            label="Email"
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="you@example.com"
            error={touched.email ? errors.email : undefined}
          />
            <div>
              <FormInput
                label="Password"
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="At least 8 characters"
                hint="Use at least 8 characters"
                error={touched.password ? errors.password : undefined}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="pointer-events-auto text-xs text-secondary hover:text-primary uppercase tracking-wide"
                  >
                    {showPassword ? '(hide)' : '(show)'}
                  </button>
                }
              />
            </div>
          {formError && <Alert>{formError}</Alert>}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creating…' : 'Create account'}</Button>
        </form>
      )}
    </AuthLayout>
  );
};
