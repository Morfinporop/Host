import { useState } from 'react';
import { Server } from '../App';
import { api } from '../api';

interface Props {
  server: Server | null;
}

export function Players({ server }: Props) {
  const [kickReason, setKickReason] = useState('');
  const [banDuration, setBanDuration] = useState('60');
  const [targetPlayer, setTargetPlayer] = useState('');
  const [action, setAction] = useState<'kick' | 'ban' | null>(null);

  const executeAction = async () => {
    if (!server || !targetPlayer) return;
    
    let command = '';
    if (action === 'kick') {
      command = `kick "${targetPlayer}" "${kickReason || 'Kicked by admin'}"`;
    } else if (action === 'ban') {
      command = `banid ${banDuration} "${targetPlayer}"`;
    }

    if (command) {
      try {
        await api.sendCommand(server.id, command);
        setAction(null);
        setTargetPlayer('');
        setKickReason('');
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">Выберите сервер</h3>
          <p className="text-zinc-500">Выберите сервер для управления игроками</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Игроки</h1>
        <p className="text-zinc-500">{server.name}</p>
      </div>

      {action && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-zinc-700/50 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">
              {action === 'kick' ? 'Кикнуть игрока' : 'Забанить игрока'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">SteamID / Имя игрока</label>
                <input
                  type="text"
                  value={targetPlayer}
                  onChange={(e) => setTargetPlayer(e.target.value)}
                  placeholder="STEAM_0:1:12345678"
                  className="w-full"
                />
              </div>

              {action === 'kick' && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Причина</label>
                  <input
                    type="text"
                    value={kickReason}
                    onChange={(e) => setKickReason(e.target.value)}
                    placeholder="Нарушение правил"
                    className="w-full"
                  />
                </div>
              )}

              {action === 'ban' && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Длительность (минуты)</label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    placeholder="60"
                    className="w-full"
                  />
                  <p className="text-xs text-zinc-500 mt-1">0 = навсегда</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAction(null)}
                className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700"
              >
                Отмена
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-3 rounded-xl text-white ${
                  action === 'ban' ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'
                }`}
              >
                {action === 'kick' ? 'Кикнуть' : 'Забанить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 mb-8">
        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setAction('kick')}
              disabled={!server.running}
              className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl text-yellow-400 hover:bg-yellow-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl mb-2">👢</div>
              <div className="font-medium">Кик</div>
            </button>

            <button
              onClick={() => setAction('ban')}
              disabled={!server.running}
              className="p-4 bg-red-600/10 border border-red-600/30 rounded-xl text-red-400 hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl mb-2">🔨</div>
              <div className="font-medium">Бан</div>
            </button>

            <button
              onClick={() => server.running && api.sendCommand(server.id, 'ulx chatmute')}
              disabled={!server.running}
              className="p-4 bg-purple-600/10 border border-purple-600/30 rounded-xl text-purple-400 hover:bg-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl mb-2">🔇</div>
              <div className="font-medium">Мут</div>
            </button>

            <button
              onClick={() => server.running && api.sendCommand(server.id, 'status')}
              disabled={!server.running}
              className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl text-blue-400 hover:bg-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Статус</div>
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-4">Отправить команду</h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="ulx kick player reason..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && server.running) {
                  api.sendCommand(server.id, (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                if (input.value && server.running) {
                  api.sendCommand(server.id, input.value);
                  input.value = '';
                }
              }}
              disabled={!server.running}
              className="px-6 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Выполнить
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white mb-4">Полезные команды</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              { cmd: 'status', desc: 'Список игроков и информация о сервере' },
              { cmd: 'users', desc: 'Список подключенных пользователей' },
              { cmd: 'kick "name" "reason"', desc: 'Кикнуть игрока' },
              { cmd: 'banid minutes steamid', desc: 'Забанить по SteamID' },
              { cmd: 'removeid steamid', desc: 'Разбанить по SteamID' },
              { cmd: 'listid', desc: 'Список забаненных' },
              { cmd: 'ulx ban player time reason', desc: 'ULX бан' },
              { cmd: 'ulx kick player reason', desc: 'ULX кик' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => server.running && api.sendCommand(server.id, item.cmd)}
              >
                <code className="text-cyan-400 flex-shrink-0">{item.cmd}</code>
                <span className="text-zinc-500 truncate">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!server.running && (
        <div className="glass rounded-2xl p-8 border border-yellow-500/30 bg-yellow-500/5 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Сервер не запущен</h3>
          <p className="text-zinc-400">Запустите сервер для управления игроками</p>
        </div>
      )}
    </div>
  );
}
