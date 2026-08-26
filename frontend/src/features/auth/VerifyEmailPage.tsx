import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { AuthLayout } from '../../components/AuthLayout';
import { authApi } from '../../core/api/endpoints/auth';
import { CheckCircle2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
        timeoutRef.current = setTimeout(() => navigate('/login', { replace: true }), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Invalid or expired verification token.');
      });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, navigate]);

  const footer = status === 'error' ? (
    <>
      <Link to="/forgot-password">Request a new link</Link>
    </>
  ) : undefined;

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We are verifying your email address."
      footer={footer}
    >
      {status === 'loading' && <p className="message message--info">Verifying…</p>}
      {status === 'success' && (
        <div className="auth-success" role="status">
          <CheckCircle2 size={32} className="auth-success__icon" aria-hidden="true" />
          <p>{message}</p>
          <Link to="/login"><Button className="mt-4">Back to sign in</Button></Link>
        </div>
      )}
      {status === 'error' && (
        <>
          <p className="message message--error" role="alert">{message}</p>
          <div className="mt-4">
            <Button to="/login" className="w-full">Back to sign in</Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
};
