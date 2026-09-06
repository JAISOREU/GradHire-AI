import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { AuthLayout } from '../../components/AuthLayout';
import { authApi } from '../../core/api/endpoints/auth';

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
      {status === 'loading' && <Alert variant="info">Verifying…</Alert>}
      {status === 'success' && (
        <div className="auth-success" role="status">
          <p>{message}</p>
          <Link to="/login"><Button className="mt-4">Back to sign in</Button></Link>
        </div>
      )}
      {status === 'error' && (
        <>
          <Alert>{message}</Alert>
          <div className="mt-4">
            <Button to="/login" className="w-full">Back to sign in</Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
};
