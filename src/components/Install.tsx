import { useState, useEffect, useRef } from 'react';
import { Server } from '../App';
import { api } from '../api';
import { useWebSocket } from '../hooks/useWebSocket';

interface Props {
  server: Server | null;
  onComplete: () => void;
}

export function Install({ server, onComplete }: Props) {
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const { logs } = useWebSocket(server?.id || null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const downloadLogs = logs.filter(l => l.includes('%') || l.includes('downloading') || l.includes('Downloading'));
    if (downloadLogs.length > 0) {
      const match = downloadLogs[downloadLogs.length - 1].match(/(\d+)%/);
      if (match) {
        setProgress(parseInt(match[1]));
      }
    }
    if (logs.some(l => l.includes('completed successfully') || l.includes('Success'))) {
      setProgress(100);
      setInstalling(false);
      onComplete();
    }
  }, [logs, onComplete]);

  const startInstall = async () => {
    if (!server) return;
    
    setInstalling(true);
    setProgress(0);
    
    try {
      await api.installServer(server.id);
    } catch (e) {
      console.error(e);
      setInstalling(false);
    }
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">📥</div>
          <h3 className="text-xl font-semibold text-white mb-2">Выберите сервер</h3>
          <p className="text-zinc-500">Выберите сервер для установки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Установка сервера</h1>
        <p className="text-zinc-500">{server.name}</p>
      </div>

      <div className="glass rounded-2xl p-6 border border-zinc-800/50 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
            server.installed ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            {server.installed ? '✅' : '📦'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {server.installed ? 'Сервер установлен' : 'Garry\'s Mod Dedicated Server'}
            </h2>
            <p className="text-zinc-500">
              {server.installed 
                ? 'Сервер готов к запуску. Вы можете переустановить или обновить сервер.'
                : 'Установка через SteamCMD. Требуется ~8 GB свободного места.'
              }
            </p>
          </div>
          <button
            onClick={startInstall}
            disabled={installing}
            className={`px-6 py-3 rounded-xl font-medium text-white transition-all ${
              installing
                ? 'bg-zinc-700 cursor-not-allowed'
                : server.installed
                  ? 'bg-yellow-600 hover:bg-yellow-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
            }`}
          >
            {installing ? '⏳ Установка...' : server.installed ? '🔄 Обновить' : '📥 Установить'}
          </button>
        </div>

        {(installing || logs.length > 0) && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Прогресс установки</span>
                <span className="text-sm text-zinc-400">{progress}%</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`py-0.5 ${
                    log.includes('[ERROR]') || log.includes('Error') ? 'text-red-400' :
                    log.includes('[GMOD]') ? 'text-blue-400' :
                    log.includes('[SteamCMD]') ? 'text-purple-400' :
                    log.includes('Success') || log.includes('completed') ? 'text-green-400' :
                    log.includes('%') ? 'text-cyan-400' :
                    'text-zinc-400'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>ℹ️</span> Информация
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">App ID</span>
              <span className="text-zinc-300">4020</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Размер</span>
              <span className="text-zinc-300">~8 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Время установки</span>
              <span className="text-zinc-300">10-30 минут</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Статус</span>
              <span className={server.installed ? 'text-green-400' : 'text-yellow-400'}>
                {server.installed ? 'Установлен' : 'Не установлен'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Процесс установки
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                installing || server.installed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
              }`}>1</span>
              <span className="text-zinc-400">Загрузка SteamCMD</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                (installing && progress > 10) || server.installed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
              }`}>2</span>
              <span className="text-zinc-400">Авторизация (anonymous)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                (installing && progress > 20) || server.installed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
              }`}>3</span>
              <span className="text-zinc-400">Загрузка файлов сервера</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                server.installed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
              }`}>4</span>
              <span className="text-zinc-400">Создание конфигурации</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-6 border border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> После установки
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-zinc-800/30 rounded-xl p-4">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-white mb-1">Настройте сервер</div>
            <div className="text-zinc-500">Укажите gamemode, карту и другие параметры</div>
          </div>
          <div className="bg-zinc-800/30 rounded-xl p-4">
            <div className="text-2xl mb-2">🔑</div>
            <div className="font-medium text-white mb-1">Получите GSLT</div>
            <div className="text-zinc-500">Нужен для отображения в списке серверов</div>
          </div>
          <div className="bg-zinc-800/30 rounded-xl p-4">
            <div className="text-2xl mb-2">▶️</div>
            <div className="font-medium text-white mb-1">Запустите сервер</div>
            <div className="text-zinc-500">И начните играть!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
