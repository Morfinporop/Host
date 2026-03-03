import { useState } from 'react';
import { Save, RotateCcw, Shield, Globe, Clock, Cpu } from 'lucide-react';
import { useServerStore } from '../store/serverStore';

export default function Settings() {
  const { selectedServer } = useServerStore();
  
  const [settings, setSettings] = useState({
    hostname: selectedServer?.name || 'My GMod Server',
    maxPlayers: selectedServer?.maxPlayers || 64,
    gamemode: selectedServer?.gamemode || 'darkrp',
    map: selectedServer?.map || 'rp_downtown_v4c_v2',
    tickrate: selectedServer?.tickrate || 66,
    password: '',
    rconPassword: '',
    sv_allowcslua: true,
    sv_downloadurl: '',
    sv_loadingurl: '',
    sv_region: 3,
  });

  const gamemodes = [
    { value: 'darkrp', label: 'DarkRP' },
    { value: 'terrortown', label: 'Trouble in Terrorist Town' },
    { value: 'sandbox', label: 'Sandbox' },
    { value: 'murder', label: 'Murder' },
    { value: 'prophunt', label: 'Prop Hunt' },
    { value: 'deathrun', label: 'Deathrun' },
  ];

  const regions = [
    { value: 0, label: 'US East' },
    { value: 1, label: 'US West' },
    { value: 2, label: 'South America' },
    { value: 3, label: 'Europe' },
    { value: 4, label: 'Asia' },
    { value: 5, label: 'Australia' },
    { value: 6, label: 'Middle East' },
    { value: 7, label: 'Africa' },
    { value: 255, label: 'World' },
  ];

  const maps = [
    'rp_downtown_v4c_v2',
    'rp_rockford_v2b',
    'rp_evocity_v33x',
    'ttt_minecraft_b5',
    'ttt_67thway_v14',
    'gm_construct',
    'gm_flatgrass',
    'gm_bigcity',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Настройки сервера</h2>
          <p className="text-gray-400">Конфигурация {selectedServer?.name || 'сервера'}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Сбросить
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Save className="w-5 h-5" />
            Сохранить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-400" />
            Основные настройки
          </h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Название сервера</label>
            <input
              type="text"
              value={settings.hostname}
              onChange={(e) => setSettings({...settings, hostname: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Gamemode</label>
              <select
                value={settings.gamemode}
                onChange={(e) => setSettings({...settings, gamemode: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                {gamemodes.map((gm) => (
                  <option key={gm.value} value={gm.value}>{gm.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Карта</label>
              <select
                value={settings.map}
                onChange={(e) => setSettings({...settings, map: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                {maps.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Макс. игроков</label>
              <input
                type="number"
                value={settings.maxPlayers}
                onChange={(e) => setSettings({...settings, maxPlayers: parseInt(e.target.value)})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tickrate</label>
              <select
                value={settings.tickrate}
                onChange={(e) => setSettings({...settings, tickrate: parseInt(e.target.value)})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                <option value={33}>33</option>
                <option value={66}>66</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Регион</label>
            <select
              value={settings.sv_region}
              onChange={(e) => setSettings({...settings, sv_region: parseInt(e.target.value)})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
            >
              {regions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Безопасность
          </h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Пароль сервера</label>
            <input
              type="password"
              value={settings.password}
              onChange={(e) => setSettings({...settings, password: e.target.value})}
              placeholder="Оставьте пустым для публичного сервера"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">RCON пароль</label>
            <input
              type="password"
              value={settings.rconPassword}
              onChange={(e) => setSettings({...settings, rconPassword: e.target.value})}
              placeholder="Пароль для удаленного управления"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Разрешить клиентские Lua скрипты</p>
              <p className="text-sm text-gray-500">sv_allowcslua</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sv_allowcslua}
                onChange={(e) => setSettings({...settings, sv_allowcslua: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-400" />
            FastDL и загрузка
          </h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">FastDL URL</label>
            <input
              type="text"
              value={settings.sv_downloadurl}
              onChange={(e) => setSettings({...settings, sv_downloadurl: e.target.value})}
              placeholder="https://fastdl.yourserver.com/"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Loading Screen URL</label>
            <input
              type="text"
              value={settings.sv_loadingurl}
              onChange={(e) => setSettings({...settings, sv_loadingurl: e.target.value})}
              placeholder="https://yourserver.com/loading"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Автоматизация
          </h3>
          
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Авто-рестарт при краше</p>
              <p className="text-sm text-gray-500">Перезапускать сервер автоматически</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Авто-обновление</p>
              <p className="text-sm text-gray-500">Обновлять при выходе новой версии</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Плановый рестарт</p>
              <p className="text-sm text-gray-500">Рестарт каждые 24 часа</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
