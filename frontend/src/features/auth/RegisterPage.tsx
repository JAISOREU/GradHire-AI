import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { roleHomePath } from '../../core/utils/navigation';
import type { UserRole } from '../../core/types';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(email, password, role, name || undefined);
      navigate(roleHomePath(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="card__subtitle">Join as a student or an employer.</p>
        <form onSubmit={handleSubmit} className="stack mt-4">
          <div className="role-picker">
            <button type="button" className={`role-option ${role === 'STUDENT' ? 'is-selected' : ''}`} onClick={() => setRole('STUDENT')}>
              <strong>🎓 Student / Fresh grad</strong>
              <span>Browse jobs, apply, get AI recommendations</span>
            </button>
            <button type="button" className={`role-option ${role === 'EMPLOYER' ? 'is-selected' : ''}`} onClick={() => setRole('EMPLOYER')}>
              <strong>🏢 Employer</strong>
              <span>Post jobs and review applicants</span>
            </button>
          </div>
          <FormInput label="Name (optional)" id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <FormInput label="Email" id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <FormInput label="Password" id="reg-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" hint="Use at least 6 characters" />
          {error && <div className="message message--error" role="alert">{error}</div>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create account'}</Button>
        </form>
        <p className="auth-card__foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
