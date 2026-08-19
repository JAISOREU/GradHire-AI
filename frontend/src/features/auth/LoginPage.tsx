import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { roleHomePath } from '../../core/utils/navigation';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: loginSchema,
    initialValues: { email: '', password: '' },
    onSubmit: async (values: LoginValues) => {
      const user = await login(values.email, values.password);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2>Welcome back</h2>
          <p className="card__subtitle">Sign in to your Gradture account.</p>
        </div>
        <form onSubmit={handleSubmit} className="stack mt-4">
          <FormInput label="Email" id="login-email" type="email" required value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="you@example.com" error={touched.email ? errors.email : undefined} />
          <div style={{ position: 'relative' }}>
            <FormInput label="Password" id="login-password" type={showPassword ? 'text' : 'password'} required value={values.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} placeholder="Your password" error={touched.password ? errors.password : undefined} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '0.5rem', top: '1.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {formError && <div className="message message--error" role="alert">{formError}</div>}
          <div className="flex items-center justify-between">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
            <Link to="/forgot-password" className="text-sm text-secondary hover:text-primary">Forgot password?</Link>
          </div>
        </form>
        <p className="auth-card__foot">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};
