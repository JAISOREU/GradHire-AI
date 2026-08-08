import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'warning';

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  timeoutId?: ReturnType<typeof setTimeout>;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue>({ toasts: [], addToast: () => {}, removeToast: () => {}, pauseToast: () => {}, resumeToast: () => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const pauseToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return prev.map((t) => t.id === id ? { ...t, timeoutId: undefined } : t);
    });
  }, []);

  const resumeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (!toast) return prev;
      const timeoutId = setTimeout(() => removeToast(id), 2000);
      return prev.map((t) => t.id === id ? { ...t, timeoutId } : t);
    });
  }, [removeToast]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => {
      const timeoutId = setTimeout(() => removeToast(id), 4000);
      return [...prev, { id, type, message, timeoutId }];
    });
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, pauseToast, resumeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            onMouseEnter={() => pauseToast(toast.id)}
            onMouseLeave={() => resumeToast(toast.id)}
            role="alert"
          >
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', marginLeft: '0.5rem', fontSize: '1rem', lineHeight: 1, color: 'inherit', opacity: 0.7 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
