import { useEffect, useState } from 'react';
import { isApiOffline, onApiStatusChange } from '../core/api/client';

export const ApiStatusPill = () => {
  const [offline, setOffline] = useState<boolean>(() => isApiOffline());

  useEffect(() => onApiStatusChange(setOffline), []);

  if (!offline) return null;

  return (
    <div className="api-status-pill" role="status" aria-live="polite">
      <span className="api-status-pill__dot" aria-hidden="true" />
      <span>Offline — Gradture servers unreachable</span>
    </div>
  );
};