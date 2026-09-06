import { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/v1\/?$/, '') || '';

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Dynamically import socket.io-client so it is not bundled in the
    // initial entry chunk — landing page visitors don't need real-time.
    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;

      const s = io(API_BASE || undefined, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));
      s.on('connect_error', () => setConnected(false));

      setSocket(s);
    });

    return () => {
      cancelled = true;
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
