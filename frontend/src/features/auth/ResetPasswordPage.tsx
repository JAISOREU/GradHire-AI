import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { ThemeBackground } from '../../components/ThemeBackground';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { authApi } from '../../core/api/endpoints/auth';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: resetPasswordSchema,
    initialValues: { password: '', confirmPassword: '' },
    onSubmit: async (values: ResetPasswordValues) => {
      if (!token) {
        throw new Error('Missing reset token');
      }
      await authApi.resetPassword(token, values.password);
      setSuccess(true);
      timeoutRef.current = setTimeout(() => navigate('/login', { replace: true }), 2000);
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!token) {
    return (
      <div className="auth-page fade-in">
        <div className="auth-card">
          <h2>Invalid reset link</h2>
          <p className="card__subtitle">The password reset link is missing or invalid.</p>
          <Link to="/forgot-password"><Button>Request a new link</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page fade-in">
      <ThemeBackground />
      <div className="auth-card">
        <div className="auth-card__header">
          <h2>Set a new password</h2>
          <p className="card__subtitle">Choose a strong password for your account.</p>
        </div>
        {success ? (
          <p className="message message--success">Password reset successfully. Redirecting to sign in…</p>
        ) : (
          <form onSubmit={handleSubmit} className="stack mt-4">
            <div style={{ position: 'relative' }}>
              <FormInput label="New password" id="reset-password" type={showPassword ? 'text' : 'password'} required value={values.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} placeholder="Min. 8 characters" error={touched.password ? errors.password : undefined} />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '0.5rem', top: '2.65rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <FormInput label="Confirm password" id="reset-confirm" type={showConfirm ? 'text' : 'password'} required value={values.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} placeholder="Repeat your password" error={touched.confirmPassword ? errors.confirmPassword : undefined} />
              <button type="button" onClick={() => setShowConfirm((prev) => !prev)} style={{ position: 'absolute', right: '0.5rem', top: '2.65rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {formError && <div className="message message--error" role="alert">{formError}</div>}
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Resetting…' : 'Reset password'}</Button>
          </form>
        )}
        <p className="auth-card__foot">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};
