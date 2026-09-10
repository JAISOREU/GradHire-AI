import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { AuthLayout } from '../../components/AuthLayout';
import { Alert } from '../../components/Alert';
import { Skeleton } from '../../components/Skeleton';
import { roleHomePath } from '../../core/utils/navigation';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { slideUpVariants, transitionBase } from '../../animations';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.095-1.695-.375-.3-1.095-.735.015-.75 1.08-.015 1.845.99 2.205 1.41 1.29 1.71 3.345 1.23 4.17.93.135-.735.54-1.23.975-1.515-3.375-.375-6.9-1.68-6.9-7.47 0-1.65.585-3 1.545-4.05-.15-.375-.67-1.89.15-3.93 0 0 1.26-.405 4.125 1.545 1.2-.33 2.475-.495 3.75-.495s2.55.165 3.75.495c2.865-1.95 4.125-1.545 4.125-1.545.82 2.04.3 3.555.15 3.93.96 1.05 1.545 2.4 1.545 4.05 0 5.805-3.54 7.095-6.915 7.47.54.465 1.005 1.365 1.005 2.76 0 1.995-.015 3.6-.015 4.095 0 .42.225.915.84.765C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" fill="currentColor" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

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

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

type Mode = 'login' | 'register';

type AuthPageProps = {
  initialMode?: Mode;
};

export const AuthPage = ({ initialMode = 'login' }: AuthPageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, oauthLogin } = useAuth();
  const [mode, setMode] = useState<Mode>(() => {
    const q = searchParams.get('mode');
    if (q === 'signup') return 'register';
    if (q === 'signin') return 'login';
    return initialMode;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const loginForm = useFormValidation<LoginValues>({
    schema: loginSchema,
    initialValues: { email: '', password: '' },
    onSubmit: async (values) => {
      const user = await login(values.email, values.password);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

  const registerForm = useFormValidation<RegisterValues>({
    schema: registerSchema,
    initialValues: { email: '', password: '', name: '', role: 'STUDENT' },
    onSubmit: async (values) => {
      const user = await register(values.email, values.password, values.role, values.name?.trim() || undefined);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

  const currentForm = isLogin ? loginForm : registerForm;
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = currentForm;

  const handleOAuth = async (provider: 'google' | 'github' | 'linkedin') => {
    setOauthLoading(provider);
    try {
      await oauthLogin(provider);
    } catch {
      setOauthLoading(null);
    }
  };

  const switchToRegister = () => setMode('register');
  const switchToLogin = () => setMode('login');

  useEffect(() => {
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
  }, [mode]);

  return (
    <AuthLayout
      title={isLogin ? 'Welcome back' : 'Create your account'}
      subtitle={isLogin ? 'Sign in to your Gradture account.' : 'Join as talent or an employer.'}
      footer={
        <div className="flex items-center justify-center gap-2 text-sm">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={switchToRegister} className="text-primary hover:underline">Create one</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={switchToLogin} className="text-primary hover:underline">Sign in</button>
            </>
          )}
        </div>
      }
    >
      <div className="relative flex rounded-lg border border-border bg-surface-muted p-1 mb-4">
        <motion.div
          className="absolute top-1 bottom-1 rounded-md bg-surface shadow-sm"
          initial={false}
          animate={{ left: isLogin ? '4px' : 'calc(50% + 2px)', width: 'calc(50% - 6px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <button
          type="button"
          onClick={switchToLogin}
          className={`relative flex-1 rounded-md py-1.5 text-sm font-medium transition-colors z-10 ${
            isLogin ? 'text-primary' : 'text-text-secondary hover:text-text'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={switchToRegister}
          className={`relative flex-1 rounded-md py-1.5 text-sm font-medium transition-colors z-10 ${
            !isLogin ? 'text-primary' : 'text-text-secondary hover:text-text'
          }`}
        >
          Create account
        </button>
      </div>

      {isSubmitting ? (
        <div className="space-y-3">
          <Skeleton lines={isLogin ? 2 : 3} />
          <Skeleton lines={1} className="!h-10" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            className="space-y-3"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitionBase}
          >
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={transitionBase}
              >
                <FormInput
                  label="Name"
                  id="auth-name"
                  autoComplete="name"
                  value={registerForm.values.name}
                  onChange={(e) => registerForm.handleChange('name', e.target.value)}
                  onBlur={() => registerForm.handleBlur('name')}
                  placeholder="Your name"
                  error={registerForm.touched.name ? registerForm.errors.name : undefined}
                />
              </motion.div>
            )}
            {!isLogin && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Account type</span>
                <select value={registerForm.values.role} onChange={(e) => registerForm.handleChange('role', e.target.value as RegisterValues['role'])} className="w-full rounded-md border px-3 py-2">
                  <option value="STUDENT">Talent</option>
                  <option value="EMPLOYER">Employer</option>
                </select>
              </label>
            )}
            <FormInput
              label="Email"
              id="auth-email"
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
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                hint={!isLogin ? 'Use at least 8 characters' : undefined}
                error={touched.password ? errors.password : undefined}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="pointer-events-auto text-text-secondary hover:text-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />
            </div>
            {formError && <Alert>{formError}</Alert>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (isLogin ? 'Signing in…' : 'Creating…') : isLogin ? 'Sign in' : 'Create account'}
            </Button>
            {isLogin && (
              <div className="text-center">
                <Link to="/forgot-password" className="text-xs text-text-secondary hover:text-primary">Forgot password?</Link>
              </div>
            )}
          </motion.form>
        </AnimatePresence>
      )}

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
          <span className="bg-surface px-2 text-text-tertiary">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button type="button" variant="secondary" className="w-full min-h-[44px]" disabled={isSubmitting || !!oauthLoading} onClick={() => handleOAuth('google')}>
          {oauthLoading === 'google' ? (
            'Connecting to Google…'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <GoogleIcon />
              <span className="font-medium text-sm">Continue with Google</span>
            </span>
          )}
        </Button>
        <Button type="button" variant="secondary" className="w-full min-h-[44px]" disabled={isSubmitting || !!oauthLoading} onClick={() => handleOAuth('github')}>
          {oauthLoading === 'github' ? (
            'Connecting to GitHub…'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <GitHubIcon />
              <span className="font-medium text-sm">Continue with GitHub</span>
            </span>
          )}
        </Button>
        <Button type="button" variant="secondary" className="w-full min-h-[44px]" disabled={isSubmitting || !!oauthLoading} onClick={() => handleOAuth('linkedin')}>
          {oauthLoading === 'linkedin' ? (
            'Connecting to LinkedIn…'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LinkedInIcon />
              <span className="font-medium text-sm">Continue with LinkedIn</span>
            </span>
          )}
        </Button>
      </div>
    </AuthLayout>
  );
};
