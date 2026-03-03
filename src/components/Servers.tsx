import { useState } from 'react';
import { Server } from '../App';

interface Props {
  servers: Server[];
  selectedServer: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

export function Servers({ servers, selectedServer, onSelect, onRefresh }: Props) {
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    port: 27015,
    maxPlayers: 32,
    gamemode: 'sandbox',
    map: 'gm_flatgrass',
    tickrate: 66
  });

  const handleCreate = async () => {
    if (!newServer.name.trim()) {
      alert('Введите название сервера');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServer)
      });
      
      if (!res.ok) throw new Error('Failed to create');
      
      setCreating(false);
      setNewServer({
        name: '',
        port: 27015,
        maxPlayers: 32,
        gamemode: 'sandbox',
        map: 'gm_flatgrass',
        tickrate: 66
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Ошибка создания сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сервер? Это действие нельзя отменить.')) return;
    
    try {
      await fetch(`/api/servers/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/servers/${id}/start`, { method: 'POST' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/servers/${id}/stop`, { method: 'POST' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestart = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/servers/${id}/restart`, { method: 'POST' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Серверы</h1>
          <p className="text-zinc-500 text-lg">Управление игровыми серверами Garry's Mod</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary text-lg">
          <span>➕</span>
          Создать сервер
        </button>
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => !loading && setCreating(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">Новый сервер</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-2 font-medium">Название сервера</label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="Мой GMod Сервер"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 font-medium">Порт</label>
                  <input
                    type="number"
                    value={newServer.port}
                    onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) || 27015 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 font-medium">Макс. игроков</label>
                  <input
                    type="number"
                    value={newServer.maxPlayers}
                    onChange={(e) => setNewServer({ ...newServer, maxPlayers: parseInt(e.target.value) || 32 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 font-medium">Gamemode</label>
                  <input
                    type="text"
                    value={newServer.gamemode}
                    onChange={(e) => setNewServer({ ...newServer, gamemode: e.target.value })}
                    placeholder="sandbox, darkrp, ttt, murder..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 font-medium">Карта</label>
                  <input
                    type="text"
                    value={newServer.map}
                    onChange={(e) => setNewServer({ ...newServer, map: e.target.value })}
                    placeholder="gm_flatgrass, gm_construct..."
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2 font-medium">Tickrate</label>
                <input
                  type="number"
                  value={newServer.tickrate}
                  onChange={(e) => setNewServer({ ...newServer, tickrate: parseInt(e.target.value) || 66 })}
                  placeholder="33, 66, 100, 128..."
                  className="input-field"
                />
                <p className="text-xs text-zinc-600 mt-2">Рекомендуется: 33 (слабый сервер), 66 (стандарт), 100+ (мощный)</p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCreating(false)}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                    Создание...
                  </>
                ) : (
                  'Создать сервер'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {servers.map((server, index) => (
          <div
            key={server.id}
            onClick={() => onSelect(server.id)}
            className={`card p-6 cursor-pointer transition-all ${
              selectedServer === server.id ? 'gradient-border ring-2 ring-blue-500/20' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-4 h-4 rounded-full ${server.running ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-zinc-600'}`} style={server.running ? { animation: 'pulse 2s ease-in-out infinite' } : {}} />
                <div>
                  <h3 className="text-xl font-bold text-white">{server.name}</h3>
                  <div className="flex items-center gap-5 mt-2 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5">📍 Port: {server.port}</span>
                    <span className="flex items-center gap-1.5">🗺️ {server.map}</span>
                    <span className="flex items-center gap-1.5">🎮 {server.gamemode}</span>
                    <span className="flex items-center gap-1.5">⚡ {server.tickrate} tick</span>
                    <span className="flex items-center gap-1.5">👥 {server.maxPlayers} слотов</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {server.installed ? (
                  <>
                    {server.running ? (
                      <>
                        <button
                          onClick={(e) => handleRestart(server.id, e)}
                          className="p-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Перезапустить"
                        >
                          🔄
                        </button>
                        <button
                          onClick={(e) => handleStop(server.id, e)}
                          className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Остановить"
                        >
                          ⏹️
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => handleStart(server.id, e)}
                        className="p-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                        title="Запустить"
                      >
                        ▶️
                      </button>
                    )}
                  </>
                ) : (
                  <span className="badge badge-warning">Требуется установка</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(server.id); }}
                  className="p-3 rounded-xl bg-zinc-800/50 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`badge ${server.running ? 'badge-success' : 'badge-error'}`}>
                  {server.running ? '● Работает' : '○ Остановлен'}
                </span>
                {server.installed && (
                  <span className="badge badge-info">Установлен</span>
                )}
              </div>
              <div className="text-sm text-zinc-600">ID: {server.id}</div>
            </div>
          </div>
        ))}

        {servers.length === 0 && (
          <div className="card p-16 text-center">
            <div className="text-7xl mb-6">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-3">Нет серверов</h3>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              Создайте первый сервер Garry's Mod и начните управлять им через панель
            </p>
            <button onClick={() => setCreating(true)} className="btn-primary">
              <span>➕</span>
              Создать первый сервер
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
