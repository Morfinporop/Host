import { useState, useEffect, useRef } from 'react';
import { Server } from '../App';

interface Props {
  server: Server | null;
}

export function Console({ server }: Props) {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [connected, setConnected] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!server) return;

    const loadLogs = async () => {
      try {
        const res = await fetch(`/api/servers/${server.id}/logs`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {}
    };
    loadLogs();

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws?server=${server.id}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'console' || msg.type === 'install') {
          setLogs(prev => [...prev.slice(-500), msg.data]);
        }
      } catch (e) {}
    };

    return () => {
      ws.close();
    };
  }, [server?.id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendCommand = async () => {
    if (!command.trim() || !server) return;

    try {
      await fetch(`/api/servers/${server.id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim() })
      });
      setCommand('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendCommand();
    }
  };

  const quickCommands = [
    { label: 'Status', cmd: 'status' },
    { label: 'Players', cmd: 'users' },
    { label: 'Maps', cmd: 'maps *' },
    { label: 'Quit', cmd: 'quit' },
  ];

  if (!server) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="text-7xl mb-6">💻</div>
        <h2 className="text-2xl font-bold text-white mb-3">Консоль сервера</h2>
        <p className="text-zinc-500">Выберите сервер для просмотра консоли</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Консоль</h1>
          <p className="text-zinc-500 text-lg">{server.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-zinc-400">
              {connected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          <div className={`badge ${server.running ? 'badge-success' : 'badge-error'}`}>
            {server.running ? 'Сервер работает' : 'Сервер остановлен'}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        {quickCommands.map(qc => (
          <button
            key={qc.cmd}
            onClick={() => setCommand(qc.cmd)}
            className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
          >
            {qc.label}
          </button>
        ))}
        <button
          onClick={() => setLogs([])}
          className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium ml-auto"
        >
          🗑️ Очистить
        </button>
      </div>

      <div className="card-static flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 console-text bg-black/30">
          {logs.length === 0 ? (
            <div className="text-zinc-600 text-center py-10">
              {server.running ? 'Ожидание логов...' : 'Сервер не запущен. Запустите сервер для просмотра консоли.'}
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`py-0.5 ${
                  log.startsWith('[ERROR]') || log.includes('Error') ? 'text-red-400' :
                  log.startsWith('>') ? 'text-blue-400' :
                  log.includes('Warning') ? 'text-yellow-400' :
                  log.includes('connected') || log.includes('spawned') ? 'text-green-400' :
                  'text-zinc-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        <div className="p-4 border-t border-white/5 flex gap-3">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите команду сервера..."
            disabled={!server.running}
            className="input-field flex-1 console-text"
          />
          <button
            onClick={sendCommand}
            disabled={!server.running || !command.trim()}
            className="btn-primary px-6"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
