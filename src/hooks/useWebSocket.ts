import { useEffect, useRef, useCallback, useState } from 'react';
import { api } from '../api';

export function useWebSocket(serverId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!serverId) return;

    const connect = () => {
      const ws = new WebSocket(api.getWebSocketUrl(serverId));
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          if (type === 'console' || type === 'install') {
            setLogs(prev => [...prev.slice(-499), data]);
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [serverId]);

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && serverId) {
      wsRef.current.send(JSON.stringify({ type: 'command', serverId, command }));
    }
  }, [serverId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, connected, sendCommand, clearLogs };
}
