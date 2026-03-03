import { useState } from 'react';
import { Server } from '../App';
import { api } from '../api';

interface Props {
  servers: Server[];
  selectedServer: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

export function Servers({ servers, selectedServer, onSelect, onRefresh }: Props) {
  const [creating, setCreating] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    port: 27015,
    maxPlayers: 32,
    gamemode: 'sandbox',
    map: 'gm_flatgrass',
    tickrate: 66
  });

  const handleCreate = async () => {
    if (!newServer.name) return;
    
    try {
      await api.createServer(newServer);
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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сервер? Это действие нельзя отменить.')) return;
    
    try {
      await api.deleteServer(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.startServer(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async (id: string) => {
    try {
      await api.stopServer(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestart = async (id: string) => {
    try {
      await api.restartServer(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Серверы</h1>
          <p className="text-zinc-500">Управление игровыми серверами</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>➕</span>
          Создать сервер
        </button>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-lg border border-zinc-700/50 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Новый сервер</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Название</label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="Мой GMod Сервер"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Порт</label>
                  <input
                    type="number"
                    value={newServer.port}
                    onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Макс. игроков</label>
                  <input
                    type="number"
                    value={newServer.maxPlayers}
                    onChange={(e) => setNewServer({ ...newServer, maxPlayers: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Gamemode</label>
                  <input
                    type="text"
                    value={newServer.gamemode}
                    onChange={(e) => setNewServer({ ...newServer, gamemode: e.target.value })}
                    placeholder="sandbox, darkrp, ttt..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Карта</label>
                  <input
                    type="text"
                    value={newServer.map}
                    onChange={(e) => setNewServer({ ...newServer, map: e.target.value })}
                    placeholder="gm_flatgrass, gm_construct..."
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Tickrate</label>
                <input
                  type="number"
                  value={newServer.tickrate}
                  onChange={(e) => setNewServer({ ...newServer, tickrate: parseInt(e.target.value) })}
                  placeholder="33, 66, 100..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCreating(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:opacity-90 transition-opacity"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {servers.map(server => (
          <div
            key={server.id}
            className={`glass rounded-2xl p-6 border transition-all cursor-pointer ${
              selectedServer === server.id
                ? 'border-blue-500/50 bg-blue-500/5'
                : 'border-zinc-800/50 hover:border-zinc-700/50'
            }`}
            onClick={() => onSelect(server.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${server.running ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                <div>
                  <h3 className="text-xl font-semibold text-white">{server.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                    <span>📍 Порт: {server.port}</span>
                    <span>🗺️ {server.map}</span>
                    <span>🎮 {server.gamemode}</span>
                    <span>⚡ {server.tickrate} tick</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {server.installed ? (
                  <>
                    {server.running ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestart(server.id); }}
                          className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                          title="Перезапустить"
                        >
                          🔄
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStop(server.id); }}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Остановить"
                        >
                          ⏹️
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStart(server.id); }}
                        className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                        title="Запустить"
                      >
                        ▶️
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                    Требуется установка
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(server.id); }}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${server.running ? 'bg-green-500' : 'bg-zinc-600'}`} />
                <span className="text-sm text-zinc-400">
                  {server.running ? 'Работает' : 'Остановлен'}
                </span>
              </div>
              <div className="text-sm text-zinc-500">
                ID: {server.id}
              </div>
            </div>
          </div>
        ))}

        {servers.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center border border-zinc-800/50">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-white mb-2">Нет серверов</h3>
            <p className="text-zinc-500">Создайте первый сервер, чтобы начать</p>
          </div>
        )}
      </div>
    </div>
  );
}
