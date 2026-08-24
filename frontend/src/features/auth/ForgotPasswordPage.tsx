import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { AuthLayout } from '../../components/AuthLayout';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { authApi } from '../../core/api/endpoints/auth';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: forgotPasswordSchema,
    initialValues: { email: '' },
    onSubmit: async (values: ForgotPasswordValues) => {
      await authApi.forgotPassword(values.email);
      setSent(true);
    },
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we will send you a reset link."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {sent ? (
        <div className="auth-success" role="status">
          <MailCheck size={32} className="auth-success__icon" aria-hidden="true" />
          <p>If an account exists, a reset email will be sent. Please check your inbox and spam/junk folder.</p>
          <Link to="/login"><Button className="mt-4">Back to sign in</Button></Link>
        </div>
      ) : (
        <>
          {isSubmitting ? (
            <div className="stack mt-4 space-y-4">
              <div className="space-y-2">
                <div className="skeleton skeleton-text w-[30%] h-3.5" />
                <div className="skeleton skeleton-text w-full h-10" />
              </div>
              <div className="skeleton skeleton-text w-full h-10" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="stack mt-4">
              <FormInput
                label="Email"
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                error={touched.email ? errors.email : undefined}
              />
              {formError && <div className="message message--error" role="alert">{formError}</div>}
              <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Sending…' : 'Send reset link'}</Button>
            </form>
          )}
        </>
      )}
    </AuthLayout>
  );
};
