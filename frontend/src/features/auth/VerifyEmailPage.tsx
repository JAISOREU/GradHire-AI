import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { authApi } from '../../core/api/endpoints/auth';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    setStatus('loading');
    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Invalid or expired verification token.');
      });
  }, [token, navigate]);

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2>Verify your email</h2>
          <p className="card__subtitle">We are verifying your email address.</p>
        </div>
        {status === 'loading' && <p className="message message--info">Verifying…</p>}
        {status === 'success' && <p className="message message--success">{message}</p>}
        {status === 'error' && (
          <>
            <p className="message message--error">{message}</p>
            <Link to="/login"><Button className="w-full mt-4">Back to sign in</Button></Link>
          </>
        )}
      </div>
    </div>
  );
};
