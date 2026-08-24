import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { AuthLayout } from '../../components/AuthLayout';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { authApi } from '../../core/api/endpoints/auth';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
      <AuthLayout
        title="Invalid reset link"
        subtitle="The password reset link is missing or invalid."
        showBackground={false}
        footer={<Link to="/forgot-password">Request a new link</Link>}
      >
          <div className="mt-4">
            <Button to="/forgot-password" className="w-full">Request a new link</Button>
          </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {success ? (
        <div className="auth-success" role="status">
          <CheckCircle2 size={32} className="auth-success__icon" aria-hidden="true" />
          <p>Password reset successfully. Redirecting to sign in…</p>
          <Link to="/login"><Button className="mt-4">Go to sign in</Button></Link>
        </div>
      ) : isSubmitting ? (
        <div className="stack mt-4 space-y-4">
          <div className="space-y-2">
            <div className="skeleton skeleton-text w-[30%] h-3.5" />
            <div className="skeleton skeleton-text w-full h-10" />
          </div>
          <div className="space-y-2">
            <div className="skeleton skeleton-text w-[30%] h-3.5" />
            <div className="skeleton skeleton-text w-full h-10" />
          </div>
          <div className="skeleton skeleton-text w-full h-10" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="stack mt-4">
          <div>
              <FormInput
                label="New password"
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Min. 8 characters"
                error={touched.password ? errors.password : undefined}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="pointer-events-auto"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
          </div>
          <div>
              <FormInput
                label="Confirm password"
                id="reset-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Repeat your password"
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="pointer-events-auto"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
          </div>
          {formError && <div className="message message--error" role="alert">{formError}</div>}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Resetting…' : 'Reset password'}</Button>
        </form>
      )}
    </AuthLayout>
  );
};
