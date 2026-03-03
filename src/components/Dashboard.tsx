import { useState, useEffect } from 'react';
import { Server } from '../App';
import { api } from '../api';

interface Props {
  servers: Server[];
  onSelectServer: (id: string) => void;
}

interface SystemStats {
  cpu: number;
  ram: { used: number; total: number; percent: number };
  uptime: number;
}

export function Dashboard({ servers, onSelectServer }: Props) {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getSystem();
        setStats(data);
      } catch (e) {}
    };
    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const runningServers = servers.filter(s => s.running).length;

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${mins}м`;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Дашборд</h1>
        <p className="text-zinc-500">Обзор системы и серверов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm">Серверы онлайн</span>
            <span className="text-2xl">🖥️</span>
          </div>
          <div className="text-3xl font-bold text-white">{runningServers}</div>
          <div className="text-zinc-500 text-sm mt-1">из {servers.length} всего</div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm">CPU</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.cpu || 0}%</div>
          <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${stats?.cpu || 0}%` }}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm">RAM</span>
            <span className="text-2xl">💾</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.ram.percent || 0}%</div>
          <div className="text-zinc-500 text-sm mt-1">
            {stats ? `${Math.round(stats.ram.used / 1024)} / ${Math.round(stats.ram.total / 1024)} GB` : '0 / 0 GB'}
          </div>
          <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all"
              style={{ width: `${stats?.ram.percent || 0}%` }}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm">Аптайм</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats ? formatUptime(stats.uptime) : '0д 0ч 0м'}
          </div>
          <div className="text-zinc-500 text-sm mt-1">непрерывной работы</div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-zinc-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Серверы</h2>
          <span className="text-sm text-zinc-500">{servers.length} серверов</span>
        </div>

        {servers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-white mb-2">Нет серверов</h3>
            <p className="text-zinc-500 mb-6">Создайте первый сервер для начала работы</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {servers.map(server => (
              <div
                key={server.id}
                onClick={() => onSelectServer(server.id)}
                className="p-4 flex items-center gap-4 hover:bg-zinc-800/30 cursor-pointer transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${server.running ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{server.name}</div>
                  <div className="text-sm text-zinc-500">
                    {server.map} • {server.gamemode}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-zinc-400">Порт: {server.port}</div>
                  <div className="text-xs text-zinc-500">
                    {server.installed ? (server.running ? '🟢 Работает' : '⚫ Остановлен') : '⚠️ Не установлен'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
