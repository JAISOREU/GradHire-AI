import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { AuthLayout } from '../../components/AuthLayout';
import { Alert } from '../../components/Alert';
import { Skeleton } from '../../components/Skeleton';
import { roleHomePath } from '../../core/utils/navigation';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: loginSchema,
    initialValues: { email: '', password: '' },
    onSubmit: async (values: LoginValues) => {
      const user = await login(values.email, values.password);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Gradture account."
      footer={
        <>
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </>
      }
    >
      {isSubmitting ? (
        <Skeleton lines={3} className="mt-4" />
      ) : (
        <form onSubmit={handleSubmit} className="stack mt-4">
          <FormInput
            label="Email"
            id="login-email"
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
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Your password"
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
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Remember me
            </label>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-secondary hover:text-primary">Forgot password?</Link>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-tertiary">Or continue with</span>
            </div>
          </div>
          <Button type="button" variant="secondary" className="w-full" disabled={isSubmitting}>
            <span className="font-medium">GitHub</span>
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
