import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { AuthLayout } from '../../components/AuthLayout';
import { roleHomePath } from '../../core/utils/navigation';
import { getRoleLabel } from '../../core/utils/roleLabels';
import type { UserRole } from '../../core/types';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';
import { GraduationCap, Building2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  role: z.enum(['STUDENT', 'EMPLOYER']),
});

type RegisterValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: registerSchema,
    initialValues: { email: '', password: '', name: '', role: 'STUDENT' },
    onSubmit: async (values: RegisterValues) => {
      const user = await register(values.email, values.password, values.role, values.name || undefined);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

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
      {isSubmitting ? (
        <div className="stack mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
          <div className="space-y-2">
            <div className="skeleton skeleton-text w-[30%] h-3.5" />
            <div className="skeleton skeleton-text w-full h-10" />
          </div>
          <div className="space-y-2">
            <div className="skeleton skeleton-text w-[30%] h-3.5" />
            <div className="skeleton skeleton-text w-full h-10" />
          </div>
          <div className="space-y-2">
            <div className="skeleton skeleton-text w-[30%] h-3.5" />
            <div className="skeleton skeleton-text w-full h-10" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="stack mt-4">
          <div className="role-picker" role="group" aria-label="Account type">
            <button
              type="button"
              className={selectedRole === 'STUDENT' ? 'role-option is-selected' : 'role-option'}
              onClick={() => { setSelectedRole('STUDENT'); handleChange('role', 'STUDENT'); }}
              aria-pressed={selectedRole === 'STUDENT'}
            >
              <GraduationCap size={20} className="role-option__icon" aria-hidden="true" />
              <strong>{getRoleLabel('STUDENT')}</strong>
              <span>Browse jobs, apply, get recommendations</span>
            </button>
            <button
              type="button"
              className={selectedRole === 'EMPLOYER' ? 'role-option is-selected' : 'role-option'}
              onClick={() => { setSelectedRole('EMPLOYER'); handleChange('role', 'EMPLOYER'); }}
              aria-pressed={selectedRole === 'EMPLOYER'}
            >
              <Building2 size={20} className="role-option__icon" aria-hidden="true" />
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="pointer-events-auto"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>
          {formError && <div className="message message--error" role="alert">{formError}</div>}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creating…' : 'Create account'}</Button>
        </form>
      )}
    </AuthLayout>
  );
};
