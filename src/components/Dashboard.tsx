import { useState, useEffect } from 'react';
import { Server } from '../App';

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
        const res = await fetch('/api/system');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
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
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  };

  const formatBytes = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Дашборд</h1>
        <p className="text-zinc-500 text-lg">Мониторинг системы и серверов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-2">Серверы онлайн</p>
              <p className="text-4xl font-bold text-white">{runningServers}</p>
              <p className="text-zinc-500 text-sm mt-1">из {servers.length} всего</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
              🖥️
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${runningServers > 0 ? 'bg-green-500' : 'bg-zinc-600'}`} />
              <span className="text-sm text-zinc-400">
                {runningServers > 0 ? 'Система работает' : 'Нет активных серверов'}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-2">CPU нагрузка</p>
              <p className="text-4xl font-bold text-white">{stats?.cpu || 0}%</p>
              <p className="text-zinc-500 text-sm mt-1">использование</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
              ⚡
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats?.cpu || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-2">Память RAM</p>
              <p className="text-4xl font-bold text-white">{stats?.ram?.percent || 0}%</p>
              <p className="text-zinc-500 text-sm mt-1">
                {stats ? `${formatBytes(stats.ram.used)} / ${formatBytes(stats.ram.total)}` : '-- / --'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
              💾
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats?.ram?.percent || 0}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-2">Аптайм</p>
              <p className="text-4xl font-bold text-white">{stats ? formatUptime(stats.uptime) : '--'}</p>
              <p className="text-zinc-500 text-sm mt-1">непрерывной работы</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
              ⏱️
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-zinc-400">Стабильная работа</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-static overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Серверы</h2>
            <p className="text-zinc-500 text-sm mt-1">Список всех игровых серверов</p>
          </div>
          <span className="badge badge-info">{servers.length} серверов</span>
        </div>

        {servers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-7xl mb-6">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-3">Нет серверов</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Создайте первый сервер Garry's Mod чтобы начать работу с панелью управления
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {servers.map((server, index) => (
              <div
                key={server.id}
                onClick={() => onSelectServer(server.id)}
                className="p-5 flex items-center gap-5 hover:bg-white/[0.02] cursor-pointer transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={server.running ? 'status-online' : 'status-offline'} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white text-lg truncate">{server.name}</h3>
                    {!server.installed && <span className="badge badge-warning">Не установлен</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span>🗺️</span> {server.map}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🎮</span> {server.gamemode}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⚡</span> {server.tickrate} tick
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-medium">:{server.port}</div>
                  <div className={`text-sm ${server.running ? 'text-green-400' : 'text-zinc-500'}`}>
                    {server.installed ? (server.running ? 'Работает' : 'Остановлен') : 'Требуется установка'}
                  </div>
                </div>

                <div className="text-zinc-600 text-xl">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
