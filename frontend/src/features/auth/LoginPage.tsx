import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { roleHomePath } from '../../core/utils/navigation';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(roleHomePath(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="card__subtitle">Sign in to your GradHire account.</p>
        <form onSubmit={handleSubmit} className="stack mt-4">
          <FormInput label="Email" id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <FormInput label="Password" id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          {error && <div className="message message--error" role="alert">{error}</div>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p className="auth-card__foot">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};
