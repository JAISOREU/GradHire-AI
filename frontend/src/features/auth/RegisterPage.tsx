import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { roleHomePath } from '../../core/utils/navigation';
import { getRoleLabel } from '../../core/utils/roleLabels';
import type { UserRole } from '../../core/types';
import { useFormValidation } from '../../core/hooks/useFormValidation';
import { z } from 'zod';

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
  const { values, errors, touched, isSubmitting, formError, handleChange, handleBlur, handleSubmit } = useFormValidation({
    schema: registerSchema,
    initialValues: { email: '', password: '', name: '', role: 'STUDENT' },
    onSubmit: async (values: RegisterValues) => {
      const user = await register(values.email, values.password, values.role, values.name || undefined);
      navigate(roleHomePath(user.role), { replace: true });
    },
  });

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="card__subtitle">Join as talent or an employer.</p>
        <form onSubmit={handleSubmit} className="stack mt-4">
          <div className="role-picker">
            <button type="button" className={`role-option ${selectedRole === 'STUDENT' ? 'is-selected' : ''}`} onClick={() => { setSelectedRole('STUDENT'); handleChange('role', 'STUDENT'); }}>
              <strong>🎓 {getRoleLabel('STUDENT')}</strong>
              <span>Browse jobs, apply, get AI recommendations</span>
            </button>
            <button type="button" className={`role-option ${selectedRole === 'EMPLOYER' ? 'is-selected' : ''}`} onClick={() => { setSelectedRole('EMPLOYER'); handleChange('role', 'EMPLOYER'); }}>
              <strong>🏢 Employer</strong>
              <span>Post jobs and review applicants</span>
            </button>
          </div>
           <FormInput label="Name (optional)" id="reg-name" value={values.name} onChange={(e) => handleChange('name', e.target.value.trim())} onBlur={() => handleBlur('name')} placeholder="Your name" error={touched.name ? errors.name : undefined} />
          <FormInput label="Email" id="reg-email" type="email" required value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="you@example.com" error={touched.email ? errors.email : undefined} />
           <FormInput label="Password" id="reg-password" type="password" required value={values.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} placeholder="At least 8 characters" hint="Use at least 8 characters" error={touched.password ? errors.password : undefined} />
          {formError && <div className="message message--error" role="alert">{formError}</div>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create account'}</Button>
        </form>
        <p className="auth-card__foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
