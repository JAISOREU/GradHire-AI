import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { LoadingState } from '../../components/LoadingState';
import { AuthLayout } from '../../components/AuthLayout';
import { roleHomePath } from '../../core/utils/navigation';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser, status } = useAuth();

  useEffect(() => {
    const run = async () => {
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login', { replace: true, state: { authError: error } });
        return;
      }

      if (success === 'true') {
        try {
          const refreshedUser = await refreshUser();
          navigate(roleHomePath(refreshedUser?.role), { replace: true });
        } catch {
          navigate('/login', { replace: true, state: { authError: 'Authentication failed. Please try again.' } });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    run();
  }, [navigate, refreshUser, searchParams]);

  if (status === 'loading') {
    return (
      <AuthLayout title="Completing sign in" subtitle="Please wait while we finish authenticating you.">
        <LoadingState label="Finishing authentication…" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign in complete" subtitle="Redirecting you now.">
      <LoadingState label="Redirecting…" />
    </AuthLayout>
  );
};
