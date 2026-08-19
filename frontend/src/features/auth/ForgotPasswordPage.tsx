import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { authApi } from '../../core/api/endpoints/auth';

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
    <div className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2>Reset your password</h2>
          <p className="card__subtitle">Enter your email and we will send you a reset link.</p>
        </div>
        {sent ? (
          <p className="message message--success">If an account exists, a reset email will be sent. Please check your inbox and spam/junk folder.</p>
        ) : (
          <form onSubmit={handleSubmit} className="stack mt-4">
            <FormInput label="Email" id="forgot-email" type="email" required value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="you@example.com" error={touched.email ? errors.email : undefined} />
            {formError && <div className="message message--error" role="alert">{formError}</div>}
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Sending…' : 'Send reset link'}</Button>
          </form>
        )}
        <p className="auth-card__foot">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};
