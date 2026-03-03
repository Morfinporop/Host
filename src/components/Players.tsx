import { useState } from 'react';
import { Search, Ban, MessageSquare, Shield, Clock, Wifi, Trophy, UserX, Volume2 } from 'lucide-react';
import { useServerStore } from '../store/serverStore';

export default function Players() {
  const { players, selectedServer } = useServerStore();
  const [search, setSearch] = useState('');

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.steamId.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление игроками</h2>
          <p className="text-gray-400">
            {selectedServer ? `${selectedServer.name} - ${selectedServer.players} игроков онлайн` : 'Выберите сервер'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Онлайн</p>
              <p className="text-xl font-bold text-white">{players.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Забанено</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Заглушено</p>
              <p className="text-xl font-bold text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">VIP игроков</p>
              <p className="text-xl font-bold text-white">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по нику или SteamID..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-900/50 text-sm text-gray-500 font-medium">
          <div className="col-span-3">Игрок</div>
          <div className="col-span-3">SteamID</div>
          <div className="col-span-2">Время игры</div>
          <div className="col-span-1">Пинг</div>
          <div className="col-span-1">Очки</div>
          <div className="col-span-2">Действия</div>
        </div>
        
        <div className="divide-y divide-gray-700/50">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700/30 transition">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                  {player.avatar}
                </div>
                <span className="text-white font-medium">{player.name}</span>
              </div>
              <div className="col-span-3 flex items-center">
                <code className="text-sm text-gray-400 bg-gray-900/50 px-2 py-1 rounded">{player.steamId}</code>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                {formatTime(player.playtime)}
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${player.ping < 50 ? 'text-green-400' : player.ping < 100 ? 'text-yellow-400' : 'text-red-400'}`} />
                <span className="text-gray-400">{player.ping}ms</span>
              </div>
              <div className="col-span-1 flex items-center text-gray-400">
                {player.score}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-blue-400 bg-gray-900/50 rounded-lg transition" title="Сообщение">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-yellow-400 bg-gray-900/50 rounded-lg transition" title="Кик">
                  <UserX className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-400 bg-gray-900/50 rounded-lg transition" title="Бан">
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
