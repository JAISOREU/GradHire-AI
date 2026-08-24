import { FormEvent, useEffect, useRef, useState } from 'react';
import type { AuthResponse } from '../core/types';
import { Button } from './Button';
import { FormField } from './FormField';
import { ThemeBackground } from './ThemeBackground';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { api, ApiError } from '../core/api/client';
import { getRoleLabel } from '../core/utils/roleLabels';

type Mode = 'signin' | 'register';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
};

export const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<'STUDENT' | 'EMPLOYER'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError('');
      setSubmitting(false);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, mode]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data =
        mode === 'signin'
          ? await api<AuthResponse>('/api/v1/auth/login', { json: { email, password }, requiresAuth: false })
          : await api<AuthResponse>('/api/v1/auth/register', { json: { email, password, name: name || undefined, role }, requiresAuth: false });
      onSuccess(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="auth-modal">
        <ThemeBackground />
        <DialogHeader>
          <DialogTitle>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</DialogTitle>
          <DialogDescription>
            {mode === 'signin' ? 'Sign in to access your dashboard' : 'Join Gradture AI to find your next opportunity'}
          </DialogDescription>
        </DialogHeader>

        <div className="auth-tabs" role="tablist">
          <button
            className={`auth-tab ${mode === 'signin' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => switchMode('signin')}
            type="button"
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => switchMode('register')}
            type="button"
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          {mode === 'register' && (
            <FormField label="Name" id="auth-name" required={mode === 'register'}>
              <Input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </FormField>
          )}

          <FormField label="Email" id="auth-email" required>
            <Input
              ref={mode === 'signin' ? firstInputRef : undefined}
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" id="auth-password" required>
            <div className="relative">
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-[2.65rem] bg-transparent border-none cursor-pointer text-sm text-text-secondary"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormField>

          {mode === 'register' && (
            <FormField label="I am a…" id="auth-role" required>
              <Select
                id="auth-role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'STUDENT' | 'EMPLOYER')}
                options={[
                  { value: 'STUDENT', label: getRoleLabel('STUDENT') },
                  { value: 'EMPLOYER', label: getRoleLabel('EMPLOYER') },
                ]}
              />
            </FormField>
          )}

          {error && <div className="message message--error" role="alert">{error}</div>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
