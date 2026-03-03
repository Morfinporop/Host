import { useState, useEffect, useRef } from 'react';
import { Server } from '../App';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../api';

interface Props {
  server: Server | null;
}

export function Console({ server }: Props) {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { logs, connected, sendCommand, clearLogs } = useWebSocket(server?.id || null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (server?.id) {
      api.getLogs(server.id).then(existingLogs => {
        if (Array.isArray(existingLogs)) {
        }
      }).catch(() => {});
    }
  }, [server?.id]);

  const handleSend = async () => {
    if (!command.trim() || !server) return;

    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    if (connected) {
      sendCommand(command);
    } else {
      await api.sendCommand(server.id, command);
    }

    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const quickCommands = [
    { label: 'status', cmd: 'status' },
    { label: 'changelevel', cmd: 'changelevel ' },
    { label: 'kick', cmd: 'kick ' },
    { label: 'ban', cmd: 'ban ' },
    { label: 'rcon', cmd: 'rcon ' },
    { label: 'lua_run', cmd: 'lua_run ' },
  ];

  if (!server) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">💻</div>
          <h3 className="text-xl font-semibold text-white mb-2">Выберите сервер</h3>
          <p className="text-zinc-500">Выберите сервер в боковой панели для просмотра консоли</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Консоль</h1>
          <p className="text-zinc-500">{server.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            connected ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-sm">{connected ? 'Подключено' : 'Отключено'}</span>
          </div>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
          >
            🗑️ Очистить
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {quickCommands.map(qc => (
          <button
            key={qc.label}
            onClick={() => {
              setCommand(qc.cmd);
              inputRef.current?.focus();
            }}
            className="px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {qc.label}
          </button>
        ))}
      </div>

      <div className="flex-1 glass rounded-2xl border border-zinc-800/50 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/30">
          {logs.length === 0 ? (
            <div className="text-zinc-600 text-center py-8">
              {server.running ? 'Ожидание логов...' : 'Сервер остановлен. Запустите сервер для просмотра консоли.'}
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`py-0.5 console-line ${
                  log.startsWith('[ERROR]') ? 'text-red-400' :
                  log.startsWith('>') ? 'text-cyan-400' :
                  log.includes('Warning') ? 'text-yellow-400' :
                  log.includes('Error') ? 'text-red-400' :
                  log.includes('[GMOD]') ? 'text-blue-400' :
                  log.includes('[SteamCMD]') ? 'text-purple-400' :
                  log.includes('[SERVER]') ? 'text-green-400' :
                  'text-zinc-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50">
          <div className="flex gap-3">
            <span className="text-green-400 font-mono flex items-center">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={server.running ? "Введите команду..." : "Сервер остановлен"}
              disabled={!server.running}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-zinc-600"
            />
            <button
              onClick={handleSend}
              disabled={!server.running || !command.trim()}
              className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
