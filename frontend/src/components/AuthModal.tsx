import { FormEvent, useEffect, useRef, useState } from 'react';
import type { AuthResponse } from '../core/types';
import { Button } from './Button';
import { FormInput, FormSelect } from './FormField';
import { ThemeBackground } from './ThemeBackground';
import { api, ApiError } from '../core/api/client';
import { getRoleLabel } from '../core/utils/roleLabels';

type Mode = 'signin' | 'register';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
  triggerRef?: React.Ref<HTMLButtonElement>;
};

export const AuthModal = ({ open, onClose, onSuccess, triggerRef }: AuthModalProps) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<'STUDENT' | 'EMPLOYER'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError('');
      setSubmitting(false);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (triggerRef && typeof triggerRef !== 'function') {
          const el = (triggerRef as React.RefObject<HTMLButtonElement>).current;
          setTimeout(() => el?.focus(), 0);
        }
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

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

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={mode === 'signin' ? 'Sign in' : 'Create account'} onClick={onClose}>
      <div className="auth-modal fade-in" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <ThemeBackground />
        <div className="auth-modal__head">
          <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <button className="auth-modal__close" onClick={onClose} aria-label="Close" type="button">
            ×
          </button>
        </div>

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
            <FormInput label="Name" id="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          )}

          <FormInput label="Email" id="auth-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" ref={mode === 'signin' ? firstInputRef : undefined} />

          <div style={{ position: 'relative' }}>
            <FormInput label="Password" id="auth-password" type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '0.5rem', top: '2.65rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {mode === 'register' && (
            <FormSelect label="I am a…" id="auth-role" value={role} onChange={(e) => setRole(e.target.value as 'STUDENT' | 'EMPLOYER')} options={[
              { value: 'STUDENT', label: getRoleLabel('STUDENT') },
              { value: 'EMPLOYER', label: getRoleLabel('EMPLOYER') },
            ]} />
          )}

          {error && <div className="message message--error" role="alert">{error}</div>}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
};
