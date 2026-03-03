import { useState, useEffect } from 'react';
import { Server } from '../App';

interface Props {
  server: Server | null;
  onUpdate: () => void;
}

export function Settings({ server, onUpdate }: Props) {
  const [settings, setSettings] = useState({
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
    loadingUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (server) {
      setSettings({
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
        loadingUrl: server.loadingUrl || ''
      });
    }
  }, [server]);

  const handleSave = async () => {
    if (!server) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        onUpdate();
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="text-7xl mb-6">⚙️</div>
        <h2 className="text-2xl font-bold text-white mb-3">Настройки</h2>
        <p className="text-zinc-500">Выберите сервер для настройки</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Настройки</h1>
          <p className="text-zinc-500 text-lg">{server.name}</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
              Сохранение...
            </>
          ) : saved ? (
            <>✅ Сохранено</>
          ) : (
            <>💾 Сохранить</>
          )}
        </button>
      </div>

      <div className="space-y-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">🖥️</span>
            Основные настройки
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Название в панели</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="input-field"
                placeholder="Мой GMod Сервер"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Hostname (отображается в игре)</label>
              <input
                type="text"
                value={settings.hostname}
                onChange={(e) => setSettings({ ...settings, hostname: e.target.value })}
                className="input-field"
                placeholder="[RU] Awesome GMod Server"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Порт</label>
              <input
                type="number"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) || 27015 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Максимум игроков</label>
              <input
                type="number"
                value={settings.maxPlayers}
                onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) || 32 })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">🎮</span>
            Игровые настройки
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Gamemode</label>
              <input
                type="text"
                value={settings.gamemode}
                onChange={(e) => setSettings({ ...settings, gamemode: e.target.value })}
                className="input-field"
                placeholder="sandbox, darkrp, ttt, murder, prophunt..."
              />
              <p className="text-xs text-zinc-600 mt-2">Введите название gamemode</p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Стартовая карта</label>
              <input
                type="text"
                value={settings.map}
                onChange={(e) => setSettings({ ...settings, map: e.target.value })}
                className="input-field"
                placeholder="gm_flatgrass, gm_construct, rp_downtown..."
              />
              <p className="text-xs text-zinc-600 mt-2">Введите название карты</p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Tickrate</label>
              <input
                type="number"
                value={settings.tickrate}
                onChange={(e) => setSettings({ ...settings, tickrate: parseInt(e.target.value) || 66 })}
                className="input-field"
                placeholder="33, 66, 100, 128"
              />
              <p className="text-xs text-zinc-600 mt-2">33-128, рекомендуется 66</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">🔒</span>
            Безопасность
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">RCON пароль</label>
              <input
                type="password"
                value={settings.rconPassword}
                onChange={(e) => setSettings({ ...settings, rconPassword: e.target.value })}
                className="input-field"
                placeholder="Пароль для удаленного управления"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Пароль сервера</label>
              <input
                type="password"
                value={settings.svPassword}
                onChange={(e) => setSettings({ ...settings, svPassword: e.target.value })}
                className="input-field"
                placeholder="Оставьте пустым для публичного сервера"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">🔧</span>
            Steam & Workshop
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">GSLT Token</label>
              <input
                type="text"
                value={settings.gslt}
                onChange={(e) => setSettings({ ...settings, gslt: e.target.value })}
                className="input-field"
                placeholder="Game Server Login Token"
              />
              <p className="text-xs text-zinc-600 mt-2">
                Получить токен: <a href="https://steamcommunity.com/dev/managegameservers" target="_blank" className="text-blue-400 hover:underline">steamcommunity.com/dev/managegameservers</a>
              </p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Workshop Collection ID</label>
              <input
                type="text"
                value={settings.workshopCollection}
                onChange={(e) => setSettings({ ...settings, workshopCollection: e.target.value })}
                className="input-field"
                placeholder="ID коллекции Workshop для автоскачивания"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">⚡</span>
            FastDL & Loading
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">FastDL URL</label>
              <input
                type="text"
                value={settings.fastdl}
                onChange={(e) => setSettings({ ...settings, fastdl: e.target.value })}
                className="input-field"
                placeholder="https://fastdl.yourserver.com/"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">Loading Screen URL</label>
              <input
                type="text"
                value={settings.loadingUrl}
                onChange={(e) => setSettings({ ...settings, loadingUrl: e.target.value })}
                className="input-field"
                placeholder="https://yoursite.com/loading"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
