import { useState, useEffect } from 'react';
import { Server } from '../App';
import { api } from '../api';

interface Props {
  server: Server | null;
  onUpdate: () => void;
}

export function Settings({ server, onUpdate }: Props) {
  const [config, setConfig] = useState({
    name: '',
    hostname: '',
    port: 27015,
    maxPlayers: 32,
    gamemode: '',
    map: '',
    tickrate: 66,
    rconPassword: '',
    svPassword: '',
    gslt: '',
    workshopCollection: '',
    fastdl: '',
    loadingUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (server) {
      setConfig({
        name: server.name || '',
        hostname: server.hostname || server.name || '',
        port: server.port || 27015,
        maxPlayers: server.maxPlayers || 32,
        gamemode: server.gamemode || 'sandbox',
        map: server.map || 'gm_flatgrass',
        tickrate: server.tickrate || 66,
        rconPassword: server.rconPassword || '',
        svPassword: server.svPassword || '',
        gslt: server.gslt || '',
        workshopCollection: server.workshopCollection || '',
        fastdl: server.fastdl || '',
        loadingUrl: server.loadingUrl || '',
      });
    }
  }, [server]);

  const handleSave = async () => {
    if (!server) return;
    
    setSaving(true);
    try {
      await api.updateServer(server.id, config);
      onUpdate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Выберите сервер</h3>
          <p className="text-zinc-500">Выберите сервер для настройки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Настройки</h1>
          <p className="text-zinc-500">{server.name}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-xl font-medium text-white transition-all ${
            saved
              ? 'bg-green-600'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
          } disabled:opacity-50`}
        >
          {saving ? '⏳ Сохранение...' : saved ? '✅ Сохранено!' : '💾 Сохранить'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span>🖥️</span> Основные настройки
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Название сервера</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Мой GMod Сервер"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Hostname (в игре)</label>
              <input
                type="text"
                value={config.hostname}
                onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
                placeholder="[RU] Best DarkRP Server"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Порт</label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 27015 })}
                placeholder="27015"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Макс. игроков</label>
              <input
                type="number"
                value={config.maxPlayers}
                onChange={(e) => setConfig({ ...config, maxPlayers: parseInt(e.target.value) || 32 })}
                placeholder="32"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Gamemode</label>
              <input
                type="text"
                value={config.gamemode}
                onChange={(e) => setConfig({ ...config, gamemode: e.target.value })}
                placeholder="sandbox, darkrp, ttt, murder..."
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">sandbox, darkrp, ttt, murder, prophunt, zombiesurvival...</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Карта</label>
              <input
                type="text"
                value={config.map}
                onChange={(e) => setConfig({ ...config, map: e.target.value })}
                placeholder="gm_flatgrass, gm_construct..."
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">gm_flatgrass, gm_construct, rp_downtown_v4c...</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Tickrate</label>
              <input
                type="number"
                value={config.tickrate}
                onChange={(e) => setConfig({ ...config, tickrate: parseInt(e.target.value) || 66 })}
                placeholder="66"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">Рекомендуется: 33, 66, 100</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span>🔐</span> Безопасность
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">RCON Пароль</label>
              <input
                type="password"
                value={config.rconPassword}
                onChange={(e) => setConfig({ ...config, rconPassword: e.target.value })}
                placeholder="Пароль для RCON доступа"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">Пароль для удаленного управления</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Пароль сервера</label>
              <input
                type="password"
                value={config.svPassword}
                onChange={(e) => setConfig({ ...config, svPassword: e.target.value })}
                placeholder="Пароль для входа"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">Оставьте пустым для публичного сервера</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span>🎮</span> Steam & Workshop
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">GSLT Token</label>
              <input
                type="text"
                value={config.gslt}
                onChange={(e) => setConfig({ ...config, gslt: e.target.value })}
                placeholder="Ваш Game Server Login Token"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Получите на{' '}
                <a href="https://steamcommunity.com/dev/managegameservers" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  steamcommunity.com/dev/managegameservers
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Workshop Collection ID</label>
              <input
                type="text"
                value={config.workshopCollection}
                onChange={(e) => setConfig({ ...config, workshopCollection: e.target.value })}
                placeholder="1234567890"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">ID коллекции для автозагрузки аддонов</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span>⚡</span> FastDL & Loading Screen
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">FastDL URL</label>
              <input
                type="text"
                value={config.fastdl}
                onChange={(e) => setConfig({ ...config, fastdl: e.target.value })}
                placeholder="https://fastdl.example.com/gmod/"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">URL для быстрой загрузки контента</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Loading Screen URL</label>
              <input
                type="text"
                value={config.loadingUrl}
                onChange={(e) => setConfig({ ...config, loadingUrl: e.target.value })}
                placeholder="https://loading.example.com/"
                className="w-full"
              />
              <p className="text-xs text-zinc-600 mt-1">URL экрана загрузки</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Строка подключения
          </h2>
          
          <div className="bg-black/30 rounded-xl p-4 font-mono text-sm">
            <span className="text-zinc-500">connect</span>{' '}
            <span className="text-cyan-400">{window.location.hostname}:{config.port}</span>
            {config.svPassword && (
              <>
                <span className="text-zinc-500">; password</span>{' '}
                <span className="text-yellow-400">{config.svPassword}</span>
              </>
            )}
          </div>
          
          <button
            onClick={() => {
              const cmd = `connect ${window.location.hostname}:${config.port}${config.svPassword ? `; password ${config.svPassword}` : ''}`;
              navigator.clipboard.writeText(cmd);
            }}
            className="mt-3 px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 text-sm"
          >
            📋 Копировать
          </button>
        </div>
      </div>
    </div>
  );
}
