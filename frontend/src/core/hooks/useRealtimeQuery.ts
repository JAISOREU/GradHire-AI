import { useCallback, useEffect } from 'react';
import { useAsync } from './useAsync';
import { useSocket } from '../websocket/SocketContext';

type RealtimeOptions = {
  eventName: string;
  enabled?: boolean;
};

export const useRealtimeQuery = <T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: RealtimeOptions = { eventName: '' },
) => {
  const { socket, connected } = useSocket();
  const { data, loading, error, reload } = useAsync(fetcher, deps);

  const handleEvent = useCallback(() => {
    if (connected) {
      reload();
    }
  }, [connected, reload]);

  useEffect(() => {
    if (!options.eventName || !socket || !connected) return;

    socket.on(options.eventName, handleEvent);
    return () => {
      socket.off(options.eventName, handleEvent);
    };
  }, [socket, connected, options.eventName, handleEvent]);

  return { data, loading, error, reload };
};
