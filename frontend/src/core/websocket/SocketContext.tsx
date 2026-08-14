import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
    const token = localStorage.getItem('gradture_token');
    if (!token) return;

    const s = io(API_BASE || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
