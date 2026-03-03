import { useState, useEffect, useRef } from 'react';
import { Server } from '../App';

interface Props {
  server: Server | null;
  onComplete: () => void;
}

export function Install({ server, onComplete }: Props) {
  const [installing, setInstalling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!server || !installing) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws?server=${server.id}`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'install') {
          setLogs(prev => [...prev, msg.data]);
          
          if (msg.data.includes('Downloading')) {
            setProgress(prev => Math.min(prev + 2, 90));
          }
          if (msg.data.includes('validating') || msg.data.includes('Validating')) {
            setProgress(80);
          }
          if (msg.data.includes('completed') || msg.data.includes('Success')) {
            setProgress(100);
          }
        }
      } catch (e) {}
    };

    return () => ws.close();
  }, [server?.id, installing]);

  const startInstall = async () => {
    if (!server) return;
    
    setInstalling(true);
    setLogs([]);
    setProgress(5);

    try {
      await fetch(`/api/servers/${server.id}/install`, {
        method: 'POST'
      });
      onComplete();
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, '[ERROR] Installation failed']);
    }
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="text-7xl mb-6">📥</div>
        <h2 className="text-2xl font-bold text-white mb-3">Установка</h2>
        <p className="text-zinc-500">Выберите сервер для установки</p>
      </div>
    );
  }

  if (server.installed && !installing) {
    return (
      <div className="animate-fade-in">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Установка</h1>
          <p className="text-zinc-500 text-lg">{server.name}</p>
        </div>

        <div className="card p-10 text-center">
          <div className="w-24 h-24 rounded-3xl bg-green-500/20 flex items-center justify-center text-5xl mx-auto mb-6">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Сервер установлен</h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            Garry's Mod Dedicated Server уже установлен и готов к запуску
          </p>
          
          <div className="flex justify-center gap-4">
            <button onClick={startInstall} className="btn-secondary">
              🔄 Переустановить / Обновить
            </button>
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="text-lg font-bold text-white mb-4">Информация об установке</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">App ID</p>
              <p className="text-white font-medium">4020</p>
            </div>
            <div>
              <p className="text-zinc-500">Игра</p>
              <p className="text-white font-medium">Garry's Mod DS</p>
            </div>
            <div>
              <p className="text-zinc-500">Статус</p>
              <p className="text-green-400 font-medium">Установлен</p>
            </div>
            <div>
              <p className="text-zinc-500">Путь</p>
              <p className="text-white font-medium truncate">/servers/{server.id}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Установка</h1>
        <p className="text-zinc-500 text-lg">{server.name}</p>
      </div>

      {!installing ? (
        <div className="card p-10 text-center">
          <div className="w-24 h-24 rounded-3xl bg-blue-500/20 flex items-center justify-center text-5xl mx-auto mb-6">
            📥
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Установить Garry's Mod Server</h2>
          <p className="text-zinc-500 mb-8 max-w-lg mx-auto">
            Будет скачан и установлен Garry's Mod Dedicated Server через SteamCMD. 
            Это может занять 10-30 минут в зависимости от скорости интернета.
          </p>
          
          <button onClick={startInstall} className="btn-primary text-lg px-10">
            <span>🚀</span>
            Начать установку
          </button>

          <div className="mt-10 p-6 bg-black/20 rounded-xl text-left max-w-lg mx-auto">
            <h4 className="font-semibold text-white mb-3">Что будет установлено:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                SteamCMD (если не установлен)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Garry's Mod Dedicated Server (App ID: 4020)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Базовая конфигурация server.cfg
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Установка...</h2>
              <p className="text-zinc-500 text-sm mt-1">Пожалуйста, не закрывайте страницу</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{progress}%</div>
              <div className="text-sm text-zinc-500">завершено</div>
            </div>
          </div>

          <div className="progress-bar mb-6" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="bg-black/30 rounded-xl p-4 h-80 overflow-y-auto console-text">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`py-0.5 ${
                  log.includes('ERROR') || log.includes('error') ? 'text-red-400' :
                  log.includes('Success') || log.includes('completed') ? 'text-green-400' :
                  log.includes('Downloading') ? 'text-blue-400' :
                  log.includes('Validating') ? 'text-yellow-400' :
                  'text-zinc-400'
                }`}
              >
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-zinc-600">Запуск установки...</div>
            )}
            <div ref={logsEndRef} />
          </div>

          {progress === 100 && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="text-green-400 font-semibold">Установка завершена!</p>
                <p className="text-zinc-400 text-sm">Теперь вы можете запустить сервер</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
