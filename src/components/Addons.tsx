import { useState } from 'react';
import { Search, Download, Trash2, RefreshCw, ExternalLink, Package } from 'lucide-react';
import { useServerStore } from '../store/serverStore';

export default function Addons() {
  const { addons, toggleAddon } = useServerStore();
  const [search, setSearch] = useState('');
  const [workshopId, setWorkshopId] = useState('');

  const filteredAddons = addons.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление аддонами</h2>
          <p className="text-gray-400">Установка и настройка Workshop аддонов</p>
        </div>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Обновить все
        </button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Установить из Workshop</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={workshopId}
            onChange={(e) => setWorkshopId(e.target.value)}
            placeholder="Workshop ID или ссылка..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition flex items-center gap-2">
            <Download className="w-5 h-5" />
            Установить
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Пример: 123456789 или https://steamcommunity.com/sharedfiles/filedetails/?id=123456789
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск аддонов..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map((addon) => (
          <div key={addon.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-2xl">
                  {addon.image}
                </div>
                <div>
                  <h4 className="font-medium text-white">{addon.name}</h4>
                  <p className="text-sm text-gray-500">ID: {addon.workshopId}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={addon.enabled}
                  onChange={() => toggleAddon(addon.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{addon.size}</span>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-white bg-gray-900/50 rounded-lg transition">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-white bg-gray-900/50 rounded-lg transition">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-400 bg-gray-900/50 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Package className="w-12 h-12 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Коллекции Workshop</h3>
            <p className="text-gray-400">Установите целую коллекцию аддонов одним кликом</p>
          </div>
          <button className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
            Импорт коллекции
          </button>
        </div>
      </div>
    </div>
  );
}
